import { obtenerPedidosPorUsuario, crearNuevoPedido, obtenerPedidosPorComercio, actualizarEstadoPedido } from "../models/pedidoModel.js";

export const getMisPedidos = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const datosPedido = await obtenerPedidosPorUsuario(id_usuario);

        // Si el usuario no tiene pedidos, devolvemos un array vacío enseguida
        if (datosPedido.length === 0) {
            return res.status(200).json([]);
        }

       // 1. Agrupamos los datos usando .reduce()
        const pedidosAgrupadosObj = datosPedido.reduce((archivador, filaActual) => {
            const id = filaActual.id_pedido;

            // Si la "carpeta" del pedido no existe, la creamos (ahora con un array de tiendas)
            if (!archivador[id]) {
                archivador[id] = {
                    id_pedido: id,
                    fecha: filaActual.fecha,
                    total: filaActual.total,
                    estado: filaActual.estado,
                    tiendas: [] // 👈 Magia: Un array para guardar todas las tiendas de este pedido
                };
            }

            // Buscamos si ya hemos creado la sub-carpeta de esta tienda
            let tiendaActual = archivador[id].tiendas.find(t => t.nombre === filaActual.nombre_comercio);

            // Si no existe, la creamos y la metemos en el pedido
            if (!tiendaActual) {
                tiendaActual = {
                    nombre: filaActual.nombre_comercio,
                    categoria: filaActual.categoria_comercio,
                    productos: []
                };
                archivador[id].tiendas.push(tiendaActual);
            }

            // Finalmente, metemos el producto en la sub-carpeta de su tienda correspondiente
            tiendaActual.productos.push({
                nombre: filaActual.nombre_producto,
                cantidad: filaActual.cantidad,
                precio_unitario: filaActual.precio_unitario,
                imagen: filaActual.imagen 
            });

            return archivador;
        }, {});
        // 2. Convertimos el objeto gigante en un Array normal para el frontend
        const pedidosFinales = Object.values(pedidosAgrupadosObj);

        // Opcional pero recomendado: Ordenar para que los más nuevos salgan primero
        pedidosFinales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // 3. Enviamos la respuesta limpia al cliente
        return res.status(200).json(pedidosFinales);

    } catch (error) {
        console.error("Error en getMisPedidos:", error);
        return res.status(500).json({ error: "Error al recuperar los pedidos" });
    }
};

export const simularPedido = async (req, res) => {
    try {
        // Extraemos los datos que nos va a enviar el frontend en formato JSON
        const { id_usuario, id_comercio, total, productos } = req.body;

        // Validamos mínima por seguridad
        if (!id_usuario || !productos || productos.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío o faltan datos" });
        }
        
        const nuevoId = await crearNuevoPedido(id_usuario, id_comercio, total, productos)

        return res.status(201).json({
            message: "Nuevo pedido creado con exito",
            nuevoId: nuevoId
        });

    } catch (error) {
        console.error("Error al simular el pedido:", error);
        return res.status(500).json({ error: "Error interno al procesar el pago" });
    }
};
export const getPedidosPorComercio = async (req, res) => {
    try {
        const rows = await obtenerPedidosPorComercio(req.params.id_comercio);
        const pedidosMap = {};
        
        for (const row of rows) {
            if (!pedidosMap[row.id_pedido]) {
                pedidosMap[row.id_pedido] = {
                    id_pedido: row.id_pedido, fecha: row.fecha, total: row.total, estado: row.estado,
                    nombre_cliente: row.nombre_cliente, email_cliente: row.email_cliente, productos: []
                };
            }
            pedidosMap[row.id_pedido].productos.push({
                nombre: row.nombre_producto, cantidad: row.cantidad, precio_unitario: row.precio_unitario
            });
        }
        return res.json(Object.values(pedidosMap));
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener pedidos" });
    }
};

export const updateEstadoPedido = async (req, res) => {
    try {
        const { id_pedido } = req.params;
        const { estado } = req.body;
        const success = await actualizarEstadoPedido(id_pedido, estado);
        if (success) return res.json({ message: "Estado actualizado" });
        return res.status(404).json({ error: "Pedido no encontrado" });
    } catch (error) {
        return res.status(500).json({ error: "Error interno" });
    }
};