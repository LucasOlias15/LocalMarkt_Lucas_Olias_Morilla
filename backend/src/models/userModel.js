import pool from "../db/db.js";

async function getUserByEmail(userEmail) {
    try {
        // Ajustamos la consulta para que coincida con la nueva estructura si es necesario, 
        // aunque SELECT * traerá todo, es bueno saber que ahora incluye 'rol'
        const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [userEmail]);
        return rows[0]; // Devuelve el primer usuario encontrado o undefined si no existe
    } catch (error) {
        console.error('Error al obtener el usuario por email:', error);
        throw error; 
    }
}

async function getUserById(userId) {
    try {
        // MODIFICADO: Cambiamos 'id' por 'id_usuario' según la nueva documentación
        const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [userId]);
        return rows[0]; // Devuelve el primer usuario encontrado o undefined si no existe
    } catch (error) {
        console.error('Error al obtener el usuario por ID:', error);
        throw error; 
    }
}

async function createUser(nombre, email, clave, ubicacion, rol = "cliente" ) {
    try {
        // Se guarda el nuevo usuario en la base de datos y se obtiene el ID generado automáticamente
        const [result] = await pool.query(
            // Nota: 'rol' no lo ponemos porque tiene un DEFAULT ‘cliente’ en la BD
            
            'INSERT INTO usuario (nombre, email, contraseña, ubicacion_aproximada, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, clave, ubicacion, rol]
        );
        // El resultado de la consulta de inserción contiene información sobre la operación,
        // incluyendo el ID del nuevo usuario generado automáticamente por la base de datos.
        return result.insertId; 
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error; 
    }
}

async function updateUserInfo(id, campos) {
    try {
        const keys = Object.keys(campos); 
        
        const setQuery = keys.map(key => `${key} = ?`).join(", ");
        
        const values = [...Object.values(campos), id];

        const [result] = await pool.query(
            `UPDATE usuario SET ${setQuery} WHERE id_usuario = ?`, 
            values
        );
        
        return result;
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    }
}

export { getUserByEmail, createUser, getUserById , updateUserInfo};