import { getUserByEmail, createUser, getUserById , updateUserInfo} from "../models/userModel.js";
import { createComercio } from "../models/comercioModel.js";
import { getComercioByUsuarioId } from "../models/comercioModel.js";
import { REGEX_NOMBRE_USUARIO,REGEX_EMAIL,REGEX_CONTRASENYA,REGEX_TELEFONO,REGEX_NOMBRE_TIENDA,REGEX_DIRECCION,REGEX_DESCRIPCION } from "../../../common/validaciones.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const registrarUsuario = async (req, res) => {
    try {
        // 🐛 ¡EL BUG ESTABA AQUÍ! Solucionado igual que ayer en comercioController
        let fotoTienda = "";
        if (req.file) {
            // Buscamos en path o en secure_url dependiendo de la respuesta de Cloudinary
            fotoTienda = req.file.path || req.file.secure_url;
        } else {
            fotoTienda = "https://res.cloudinary.com/defaik2fl/image/upload/v1776084820/Gemini_Generated_Image_cswtzlcswtzlcswt_fn6vew.png";
        }

        // 🧹 LIMPIEZA: Quitamos 'ubicacion' de la destructuración (ya no existe en la BD)
        const { nombreUsuario, email, clave, rol, nombreComercio, descripcion, categoria, contacto, direccion, latitud, longitud } = req.body;
       
        // Verificamos los campos comunes a dueños y clientes que vienen en el body
        if (!REGEX_NOMBRE_USUARIO.test(nombreUsuario)){
            return res.status(400).json({ error: "Formato de nombre de usuario inválido. " });
        } else if (!REGEX_EMAIL.test(email)){
            return res.status(400).json({ error: "Formato de email inválido. " });      
        } else if (!REGEX_CONTRASENYA.test(clave)){
            return res.status(400).json({ error: "Formato de contraseña inválido. " });      
        }
       
        // Verificamos los campos específicos de los dueños
        if (rol === "dueño") {
            if (!REGEX_TELEFONO.test(contacto)){
                return res.status(400).json({ error: "Formato de número de teléfono inválido. " });      
            } else if (!REGEX_NOMBRE_TIENDA.test(nombreComercio)){
                return res.status(400).json({ error: "Formato de nombre de comercio inválido. " });      
            } else if (!REGEX_DIRECCION.test(direccion)){
                return res.status(400).json({ error: "Formato de direccion inválido. " });      
            } else if (!REGEX_DESCRIPCION.test(descripcion)){
                return res.status(400).json({ error: "Formato de descripcion inválido. " });      
            }
        }
       
        // Verificar si el usuario ya existe
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            // Se envia codigo de error en caso de que el usuario ya exista en la base de datos
            return res.status(409).json({ error: "El usuario ya existe." });
        }

        // Se encripta la clave si el usuario no existe 
        const hashedClave = await bcrypt.hash(clave, 10);
        
        // Si el usuario no existe, se crea uno nuevo
        let userId;
        if (rol === "cliente") {
            // Ya no le pasamos ubicación
            userId = await createUser(nombreUsuario, email, hashedClave, rol);
        } else if (rol === "dueño") {
            // Ya no le pasamos ubicación al usuario, pero SÍ guardamos las coordenadas en el comercio
            userId = await createUser(nombreUsuario, email, hashedClave, rol);
            await createComercio(nombreComercio, userId, descripcion, categoria, contacto, direccion, latitud, longitud, fotoTienda);
        }
        
        // Se envia una respuesta exitosa con el ID del nuevo usuario
        return res.status(201).json({ 
            id: userId,
            message: "Usuario OK" 
        });

    } catch (error) {
        console.error("🔥 ERROR REAL AL CREAR COMERCIO:", error); 
        return res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, clave } = req.body;

        // Guardamos el usuario en la variable user
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        // Siguiente paso comprobar las claves la encriptada y la que se recibe en el login
        const comprobarClave = await bcrypt.compare(clave, user.contraseña);

        if (!comprobarClave) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const comercio = await getComercioByUsuarioId(user.id_usuario);

        // Asignamos el rol por defecto
        let rolAsignado = "usuario";
        let comercioId = null;

        // Si la base de datos nos devuelve un comercio, ¡es un dueño!
        if (comercio) {
            rolAsignado = "dueño";
            comercioId = comercio.id_comercio;
        }

        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                email: user.email,
                rol: rolAsignado,         
                id_comercio: comercioId   
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Enviamos la respuesta al cliente con el token y algunos datos básicos del usuario
        return res.status(200).json({
            message: "Login exitoso",
            token: token,
            user: { 
                id: user.id_usuario, 
                nombre: user.nombre,
                rol: rolAsignado,
                id_comercio: comercioId
            } 
        });
        
    } catch (error) {
        console.error("Error en login:", error); 
        res.status(500).json({ error: "Error en el login" });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // 🧹 LIMPIEZA: Quitamos la ubicación de la respuesta
        res.json({
            nombre: user.nombre,
            email: user.email,
            rol: user.rol 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
};


export const actualizarPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 🧹 LIMPIEZA: Quitamos 'ubicacion' de la destructuración
        const { nombre, email, clave, nuevaClave } = req.body;

        // 1. Obtener datos actuales del usuario
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // 2. SEGURIDAD: Validar contraseña actual
        const comprobarClave = await bcrypt.compare(clave, user.contraseña);
        if (!comprobarClave) {
            return res.status(401).json({ error: "La contraseña actual es incorrecta" });
        }

        // 3. VALIDACIÓN: ¿El nuevo email está libre?
        if (email && email !== user.email) {
            const emailOcupado = await getUserByEmail(email);
            if (emailOcupado) {
                return res.status(400).json({ error: "El nuevo email ya está en uso por otra cuenta" });
            }
        }

        // 4. PREPARAR CAMPOS (Dinámico)
        const campos = {};
        if (nombre) campos.nombre = nombre;
        if (email) campos.email = email;
        
        // 🧹 LIMPIEZA: Eliminada la línea que guardaba la ubicación

        if (nuevaClave) {
            campos.contraseña = await bcrypt.hash(nuevaClave, 10);
        }

        if (Object.keys(campos).length === 0) {
            return res.status(400).json({ error: "No se han enviado cambios" });
        }

        // 5. EJECUTAR Y RESPONDER CON DATOS NUEVOS
        await updateUserInfo(userId, campos);

        const userActualizado = await getUserById(userId);

        res.json({ 
            message: "Perfil actualizado con éxito",
            user: {
                id: userActualizado.id_usuario,
                nombre: userActualizado.nombre,
                email: userActualizado.email,
                rol: req.user.rol 
            }
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar" });
    }
};