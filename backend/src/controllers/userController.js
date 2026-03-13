import { getUserByEmail, createUser, getUserById } from "../models/userModel.js";
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

        // Si el login es exitoso, generamos un token JWT con la información del usuario
        // MODIFICADO: Ahora el ID del usuario está en la columna 'id_usuario'
        const token = jwt.sign(
            { id: user.id_usuario, email: user.email },
            process.env.JWT_SECRET,
            //TODO : El token expira en 30 días, pero podríamos hacer que expire antes para mayor seguridad
            { expiresIn: '30d' });
        
        // Enviamos la respuesta al cliente con el token y algunos datos básicos del usuario
        return res.status(200).json({
            message: "Login exitoso",
            token: token,
            user: { id: user.id_usuario, nombre: user.nombre } // Enviamos datos básicos para el Front
        });
        
    } catch (error) {
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