import pool from "../db/db.js";
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
    prod.imagen, 
    dp.cantidad, 
    dp.precio_unitario
FROM pedido p
JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
JOIN producto prod ON dp.id_producto = prod.id_producto
JOIN comercio com ON prod.id_comercio = com.id_comercio 
WHERE p.id_usuario = ?;`,
      [id_usuario],
    );

    return result;
  } catch (error) {
    console.error("Error al obtener pedidos del usuario:", error);
    throw error;
  }
}

async function crearNuevoPedido(id_usuario, id_comercio, total, productos) {
  // 1. Pedimos una conexión exclusiva para hacer la transacción
  const connection = await pool.getConnection();

  try {
    // 2. ¡Iniciamos la transacción!
    await connection.beginTransaction();
       
    const [resultPedido] = await connection.query(
      `INSERT INTO pedido (id_usuario, id_comercio, fecha, total, estado) VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, id_comercio, new Date(), total, "En proceso"],
    );

    // Capturamos el ID del pedido que MySQL acaba de generar automáticamente
    const id_pedido_nuevo = resultPedido.insertId;

    // Recorremos el array de productos del carrito con un bucle
    for (const prod of productos) {
      const id_prod = prod.id_producto;
      const cant = prod.quantity || 1;
      const prec = prod.precio;

      console.log(
        `Insertando producto ${id_prod}: Cantidad ${cant}, Precio ${prec}`,
      );

      await connection.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
        [id_pedido_nuevo, id_prod, cant, prec],
      );
      await connection.query(
        `UPDATE producto 
                SET stock = stock - ? 
                WHERE id_producto = ?`,
        [cant, id_prod],
      );
    }

    // 5. Si todo ha ido bien, confirmamos los cambios en la base de datos
    await connection.commit();

    return id_pedido_nuevo; // Devolvemos el ID por si el controlador lo necesita
  } catch (error) {
    // Si algo falla, deshacemos TODO lo que se haya guardado a medias
    await connection.rollback();
    console.error("Error en la transacción del pedido:", error);
    throw error;
  } finally {
    // Siempre liberamos la conexión para que otros usuarios la puedan usar
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
            -- 👇 AQUÍ ESTABA EL FALLO: Cambiamos u.id por u.id_usuario
            JOIN usuario u ON p.id_usuario = u.id_usuario 
            JOIN producto prod ON dp.id_producto = prod.id_producto
            WHERE p.id_comercio = ?
            ORDER BY p.fecha DESC;`,
      [id_comercio],
    );
    return result;
  } catch (error) {
    console.error("❌ Error SQL en obtenerPedidosPorComercio:", error.message);
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

// Asegúrate de exportarlas al final:
export {
  obtenerPedidosPorUsuario,
  obtenerPedidosPorComercio,
  crearNuevoPedido,
  actualizarEstadoPedido,
};
