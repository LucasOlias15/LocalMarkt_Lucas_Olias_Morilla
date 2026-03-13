import pool from "../db/db.js";

async function createComercio(nombre, idUsuario, descripcion, categoria, contacto, direccion , latitud, longitud) {
    try {   
        const [result] = await pool.query(
            'INSERT INTO comercio (nombre, id_usuario, descripcion, categoria, contacto, direccion , latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, idUsuario, descripcion, categoria, contacto, direccion, latitud, longitud]
        );
        return result.insertId; 
    } catch (error) {
        console.error('Error al crear el comercio:', error);
        throw error; 
    }
}

async function getComercioById(idComercio) {
    try {
        const [rows] = await pool.query('SELECT * FROM comercio WHERE id_comercio = ?', [idComercio]);
        return rows[0]; 
    } catch (error) {
        console.error('Error al obtener el comercio:', error);
        throw error;
    }
}

async function getAllComercios() {
    try {
        const [rows] = await pool.query('SELECT * FROM comercio');
        return rows;
    } catch (error) {
        console.error('Error al obtener los comercios:', error);
        throw error;
    }
}


export { createComercio, getComercioById, getAllComercios };