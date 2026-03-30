async function obtenerPedidosPorUsuario(id_usuario) {

    try {

        const [result] = await pool.query(
            `SELECT 
                p.id_pedido, 
                p.fecha, 
                p.total, 
                p.estado, 
                com.nombre AS nombre_comercio, 
                com.categoria AS categoria_comercio, 
                prod.nombre AS nombre_producto, 
                dp.cantidad, 
                dp.precio_unitario
            FROM pedido p
            JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
            JOIN comercio com ON p.id_comercio = com.id_comercio
            JOIN producto prod ON dp.id_producto = prod.id_producto
            WHERE p.id_usuario = ?;`,
            [id_usuario]
        );

        return result;

    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        throw error;
    }

};