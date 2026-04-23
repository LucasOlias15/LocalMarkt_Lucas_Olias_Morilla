import pool from "../db/db.js";

async function verificarCompra(id_usuario, id_comercio, id_producto) {
    try {
        let query;
        let params;

        if (id_producto) {
            query = `
                SELECT COUNT(*) as count 
                FROM pedido p
                JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
                WHERE p.id_usuario = ? AND p.id_comercio = ? AND dp.id_producto = ? AND p.estado = 'Completado'
            `;
            params = [id_usuario, id_comercio, id_producto];
        } else {
            query = `
                SELECT COUNT(*) as count 
                FROM pedido p
                WHERE p.id_usuario = ? AND p.id_comercio = ? AND p.estado = 'Completado'
            `;
            params = [id_usuario, id_comercio];
        }

        const [rows] = await pool.query(query, params);
        return rows[0].count > 0;
    } catch (error) {
        console.error('❌ Error SQL en verificarCompra:', error.message);
        throw error;
    }
}

async function upsertValoracion(id_usuario, id_comercio, id_producto, puntuacion, comentario) {
    try {
        const [existing] = await pool.query(
            `SELECT id_valoracion FROM valoracion 
             WHERE id_usuario = ? AND id_comercio = ? 
             AND (id_producto = ? OR (id_producto IS NULL AND ? IS NULL))`,
            [id_usuario, id_comercio, id_producto, id_producto]
        );

        if (existing.length > 0) {
            await pool.query(
                `UPDATE valoracion SET puntuacion = ?, comentario = ? WHERE id_valoracion = ?`,
                [puntuacion, comentario, existing[0].id_valoracion]
            );
            return { id: existing[0].id_valoracion, updated: true };
        } else {
            const [result] = await pool.query(
                `INSERT INTO valoracion (id_usuario, id_comercio, id_producto, puntuacion, comentario) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id_usuario, id_comercio, id_producto, puntuacion, comentario]
            );
            return { id: result.insertId, updated: false };
        }
    } catch (error) {
        console.error('❌ Error SQL en upsertValoracion:', error.message);
        throw error;
    }
}

async function getValoracionesTienda(id_comercio) {
    try {
        const [rows] = await pool.query(
            `SELECT 
                v.id_valoracion, v.puntuacion, v.comentario, v.fecha,
                u.nombre as nombre_usuario
             FROM valoracion v
             JOIN usuario u ON v.id_usuario = u.id_usuario
             WHERE v.id_comercio = ? AND v.id_producto IS NULL
             ORDER BY v.fecha DESC`,
            [id_comercio]
        );
        return rows;
    } catch (error) {
        console.error('❌ Error SQL en getValoracionesTienda:', error.message);
        throw error;
    }
}

async function getPromedioTienda(id_comercio) {
    try {
        const [rows] = await pool.query(
            `SELECT 
                AVG(puntuacion) as promedio,
                COUNT(*) as total
             FROM valoracion 
             WHERE id_comercio = ? AND id_producto IS NULL`,
            [id_comercio]
        );
        
        const total = rows[0].total || 0;
        const promedio = rows[0].promedio ? parseFloat(rows[0].promedio).toFixed(1) : "0.0";
        
        return { promedio, total };
    } catch (error) {
        console.error('❌ Error SQL en getPromedioTienda:', error.message);
        throw error;
    }
}

async function getValoracionesByComercio(id_comercio) {
    try {
        const [rows] = await pool.query(
            `SELECT 
                v.id_valoracion, v.puntuacion, v.comentario, v.fecha, v.id_producto,
                u.nombre as nombre_usuario,
                p.nombre as nombre_producto
             FROM valoracion v
             JOIN usuario u ON v.id_usuario = u.id_usuario
             LEFT JOIN producto p ON v.id_producto = p.id_producto
             WHERE v.id_comercio = ?
             ORDER BY v.fecha DESC`,
            [id_comercio]
        );
        return rows;
    } catch (error) {
        console.error('❌ Error SQL en getValoracionesByComercio:', error.message);
        throw error;
    }
}

async function getValoracionUsuario(id_usuario, id_comercio, id_producto) {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM valoracion 
             WHERE id_usuario = ? AND id_comercio = ? 
             AND (id_producto = ? OR (id_producto IS NULL AND ? IS NULL))`,
            [id_usuario, id_comercio, id_producto, id_producto]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Error SQL en getValoracionUsuario:', error.message);
        throw error;
    }
}

async function getEstadisticasValoraciones(id_comercio) {
    try {
        const promedioTienda = await getPromedioTienda(id_comercio);
        
        const [recientes] = await pool.query(
            `SELECT 
                v.puntuacion, v.comentario, v.fecha,
                u.nombre as nombre_usuario,
                p.nombre as nombre_producto
             FROM valoracion v
             JOIN usuario u ON v.id_usuario = u.id_usuario
             LEFT JOIN producto p ON v.id_producto = p.id_producto
             WHERE v.id_comercio = ?
             ORDER BY v.fecha DESC
             LIMIT 5`,
            [id_comercio]
        );
        
        const [productosTop] = await pool.query(
            `SELECT 
                p.id_producto, p.nombre,
                AVG(v.puntuacion) as promedio,
                COUNT(*) as total
             FROM valoracion v
             JOIN producto p ON v.id_producto = p.id_producto
             WHERE v.id_comercio = ? AND v.id_producto IS NOT NULL
             GROUP BY p.id_producto
             HAVING COUNT(*) >= 3
             ORDER BY promedio DESC
             LIMIT 5`,
            [id_comercio]
        );
        
        return { promedioTienda, recientes, productosTop };
    } catch (error) {
        console.error('❌ Error SQL en getEstadisticasValoraciones:', error.message);
        throw error;
    }
}

async function deleteValoracion(id_valoracion, id_usuario) {
    try {
        const [result] = await pool.query(
            `DELETE FROM valoracion WHERE id_valoracion = ? AND id_usuario = ?`,
            [id_valoracion, id_usuario]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('❌ Error SQL en deleteValoracion:', error.message);
        throw error;
    }
}

export {
    verificarCompra,
    upsertValoracion,
    getValoracionesTienda,
    getPromedioTienda,
    getValoracionesByComercio,
    getValoracionUsuario,
    getEstadisticasValoraciones,
    deleteValoracion
};