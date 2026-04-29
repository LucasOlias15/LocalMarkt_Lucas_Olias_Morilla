import pool from "../db/db.js";
async function obtenerPedidosPorUsuario(id_usuario) {
  try {
    const [result] = await pool.query(
      `SELECT 
        p.id_pedido, 
        p.fecha, 
        p.total, 
        p.estado,
        p.id_comercio,
        com.nombre AS nombre_comercio, 
        com.categoria AS categoria_comercio,
        com.contacto AS contacto_comercio,
        u.email AS email_comercio,
        prod.nombre AS nombre_producto, 
        prod.imagen, 
        dp.cantidad, 
        dp.precio_unitario
      FROM pedido p
      JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      JOIN producto prod ON dp.id_producto = prod.id_producto
      JOIN comercio com ON prod.id_comercio = com.id_comercio
      JOIN usuario u ON com.id_usuario = u.id_usuario
      WHERE p.id_usuario = ?;`,
      [id_usuario],
    );

    return result;
  } catch (error) {
    console.error("Error al obtener pedidos del usuario:", error);
    throw error;
  }
}
// Crear un nuevo pedido 
async function crearNuevoPedido(id_usuario, id_comercio, total, productos) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
       
    const [resultPedido] = await connection.query(
      `INSERT INTO pedido (id_usuario, id_comercio, fecha, total, estado) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, id_comercio, new Date(), total, "En proceso"],
    );

    const id_pedido_nuevo = resultPedido.insertId;

    for (const prod of productos) {
      const id_prod = prod.id_producto || prod.id;
      const cant = prod.quantity || 1;
      const prec = prod.precio || prod.price;

      console.log(`Insertando producto ${id_prod}: Cantidad ${cant}, Precio ${prec}`);

      await connection.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [id_pedido_nuevo, id_prod, cant, prec],
      );

      await connection.query(
        `UPDATE producto 
         SET stock = stock - ? 
         WHERE id_producto = ?`,
        [cant, id_prod],
      );
    }

    await connection.commit();
    return id_pedido_nuevo;

  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción del pedido:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener los pedidos de una tienda
async function obtenerPedidosPorComercio(id_comercio) {
  try {
    const [result] = await pool.query(
      `SELECT 
                p.id_pedido, p.fecha, p.total, p.estado, 
                u.nombre AS nombre_cliente, u.email AS email_cliente,
                prod.nombre AS nombre_producto, 
                dp.cantidad, dp.precio_unitario
            FROM pedido p
            JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
            JOIN usuario u ON p.id_usuario = u.id_usuario 
            JOIN producto prod ON dp.id_producto = prod.id_producto
            WHERE p.id_comercio = ?
            ORDER BY p.fecha DESC;`,
      [id_comercio],
    );
    return result;
  } catch (error) {
    console.error(" Error SQL en obtenerPedidosPorComercio:", error.message);
    throw error;
  }
}

// Actualizar estado
async function actualizarEstadoPedido(id_pedido, nuevo_estado) {
  const [result] = await pool.query(
    `UPDATE pedido SET estado = ? WHERE id_pedido = ?`,
    [nuevo_estado, id_pedido],
  );
  return result.affectedRows > 0;
}

export {
  obtenerPedidosPorUsuario,
  obtenerPedidosPorComercio,
  crearNuevoPedido,
  actualizarEstadoPedido,
};
