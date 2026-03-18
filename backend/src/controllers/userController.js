import { getUserByEmail, createUser, getUserById , updateUserInfo} from "../models/userModel.js";
import { getComercioByUsuarioId } from "../models/comercioModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, clave, ubicacion } = req.body;
        // Verificar si el usuario ya existe
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            //Se envia codigo de error en caso de que el usuario ya exista en la base de datos
            return res.status(400).json({ error: "El usuario ya existe" });
        }
        // Se encripta la clave si el usuario no existe 
        const hashedClave = await bcrypt.hash(clave, 10);
        // Si el usuario no existe, se crea uno nuevo
        const userId = await createUser(nombre, email, hashedClave, ubicacion);
        // Se envia una respuesta exitosa con el ID del nuevo usuario
        return res.status(201).json({ 
            id: userId,
            message: "Usuario OK" });
    } catch (error) {
        // Aquí manejaremos los errores
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
        
        //Siguiente paso comprobar las claves la encriptada y la que se recibe en el login
        // MODIFICADO: Ahora el modelo devuelve la columna 'contraseña'
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
                rol: rolAsignado,         // Guardamos su rol en el token
                id_comercio: comercioId   // Guardamos su tienda (o null) en el token
            },
            process.env.JWT_SECRET,
                        //TODO : El token expira en 30 días, pero podríamos hacer que expire antes para mayor seguridad

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
        console.error("Error en login:", error); // Útil para depurar
        res.status(500).json({ error: "Error en el login" });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        // El ID viene del token, que el middleware dejó en req.user
        const userId = req.user.id;

        // Aquí deberíamos llamar a una función del modelo para buscar al usuario por ID
        // Supongamos que se llama getUserById(userId)
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Devolvemos los datos (sin la clave)
        // MODIFICADO: 'ubicacion' -> 'ubicacion_aproximada'
        res.json({
            nombre: user.nombre,
            email: user.email,
            ubicacion: user.ubicacion_aproximada,
            rol: user.rol // Añadimos el rol, que es útil para el Front
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
};


export const actualizarPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, email, clave, nuevaClave, ubicacion } = req.body;

        // 1. Obtener datos actuales del usuario
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // 2. SEGURIDAD: Validar contraseña actual
        const comprobarClave = await bcrypt.compare(clave, user.contraseña);
        if (!comprobarClave) {
            return res.status(401).json({ error: "La contraseña actual es incorrecta" });
        }

        // 3. VALIDACIÓN: ¿El nuevo email está libre?
        // Solo comprobamos si el email que envía es distinto al que ya tiene
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
        if (ubicacion) campos.ubicacion_aproximada = ubicacion;

        if (nuevaClave) {
            campos.contraseña = await bcrypt.hash(nuevaClave, 10);
        }

        if (Object.keys(campos).length === 0) {
            return res.status(400).json({ error: "No se han enviado cambios" });
        }

        // 5. EJECUTAR Y RESPONDER CON DATOS NUEVOS
        await updateUserInfo(userId, campos);

        // Buscamos los datos actualizados para que el Front los guarde en el localStorage
        const userActualizado = await getUserById(userId);

        res.json({ 
            message: "Perfil actualizado con éxito",
            user: {
                id: userActualizado.id_usuario,
                nombre: userActualizado.nombre,
                email: userActualizado.email,
                ubicacion: userActualizado.ubicacion_aproximada,
                rol: req.user.rol // El rol lo mantenemos del token original
            }
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar" });
    }
};