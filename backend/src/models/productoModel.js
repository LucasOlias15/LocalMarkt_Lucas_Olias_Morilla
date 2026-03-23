import pool from "../db/db.js";

// Función para insertar un producto en la BD
async function createProducto(id_comercio, nombre, descripcion, stock, precio, imagen) {
    try {
        const [result] = await pool.query(
            'INSERT INTO producto (id_comercio, nombre, descripcion, stock, precio, imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [id_comercio, nombre, descripcion, stock, precio, imagen]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error al crear el producto en el modelo:', error);
        throw error;       
    }   
}

// Función para obtener todos los productos de una tienda
async function getProductosByComercio(id_comercio) {
    try {
        const [rows] = await pool.query('SELECT * FROM producto WHERE id_comercio = ?', [id_comercio]);
        return rows;
    } catch (error) {
        console.error('Error al obtener los productos en el modelo:', error);
        throw error;
    }
}

// Funcion para actualizar un producto 
async function getProductoById(id_producto) {
    try {
        const [rows] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id_producto]);
        return rows[0]; // Retornamos solo el primer resultado (el producto)
    } catch (error) {
        console.error('Error al obtener el producto por ID:', error);
        throw error;
    }
}

// Función para actualizar un producto existente
async function updateProducto(id_producto, nombre, descripcion, stock, precio, imagen) {
    try {
        const [result] = await pool.query(
            'UPDATE producto SET nombre = ?, descripcion = ?, stock = ?, precio = ?, imagen = ? WHERE id_producto = ?',
            [nombre, descripcion, stock, precio, imagen, id_producto]
        );
        return result.affectedRows; // Nos dice cuántas filas se actualizaron
    } catch (error) {
        console.error('Error al actualizar el producto en el modelo:', error);
        throw error;
    }
}

// Función para borrar un producto por su ID
async function deleteProducto(id_producto) {
    try {
        const [result] = await pool.query(
            'DELETE FROM producto WHERE id_producto = ?',
            [id_producto]
        );
        return result.affectedRows; // Devuelve 1 si se borró, 0 si no encontró el ID
    } catch (error) {
        console.error('Error al borrar el producto en el modelo:', error);
        throw error;
    }
}

async function getAllProductosWithComercio() {
    try {
        // Seleccionamos solo lo necesario
        const [result] = await pool.query(`
            SELECT 
                p.id_producto, 
                p.nombre, 
                p.precio, 
                p.imagen, 
                p.descripcion,
                p.stock,
                c.nombre AS nombre_comercio, 
                c.categoria
            FROM producto p
            JOIN comercio c ON p.id_comercio = c.id_comercio;
        `);
        return result; 
    } catch (error) {
        console.error("Error en el modelo:", error);
        throw error;
    }
}

export { createProducto, getProductosByComercio, getProductoById, updateProducto , deleteProducto, getAllProductosWithComercio};