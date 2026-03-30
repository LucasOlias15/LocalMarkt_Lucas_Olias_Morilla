import { crearNuevoPedido, obtenerPedidosPorUsuario } from "../models/pedidoModel.js";

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

            // Si la "carpeta" del pedido no existe, la creamos con los datos generales
            if (!archivador[id]) {
                archivador[id] = {
                    id_pedido: id,
                    fecha: filaActual.fecha,
                    total: filaActual.total,
                    estado: filaActual.estado,
                    tienda: filaActual.nombre_comercio,
                    categoria: filaActual.categoria_comercio,
                    productos: [] // Iniciamos el array de productos vacío
                };
            }

            // Metemos el producto actual en el array de productos de su pedido
            archivador[id].productos.push({
                nombre: filaActual.nombre_producto,
                cantidad: filaActual.cantidad,
                precio_unitario: filaActual.precio_unitario
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
        // 1. Extraemos los datos que nos va a enviar el frontend en formato JSON
        const { id_usuario, id_comercio, total, productos } = req.body;

        // Validamos un poco por seguridad
        if (!id_usuario || !productos || productos.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío o faltan datos" });
        }

        // 2. 📝 RETO: Llama a tu función crearNuevoPedido pasándole las 4 variables de arriba.
        // Recuerda que es una promesa (usa await) y guarda lo que devuelve en una variable llamada 'nuevoId'
        
        const nuevoId = await crearNuevoPedido(id_usuario, id_comercio, total, productos)

        // 3. 📝 RETO: Devuelve una respuesta JSON al frontend con código 201 (Created)
        // Puedes enviar un objeto con un mensaje de éxito y el 'nuevoId'
        
        return res.status(201).json({
            message: "Nuevo pedido creado con exito",
            nuevoId: nuevoId
        });

    } catch (error) {
        console.error("Error al simular el pedido:", error);
        return res.status(500).json({ error: "Error interno al procesar el pago" });
    }
};