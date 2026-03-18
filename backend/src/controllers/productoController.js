import { createProducto, getProductosByComercio, getProductoById, updateProducto, deleteProducto } from "../models/productoModel.js";
import { getComercioById } from "../models/comercioModel.js";

// Controlador para registrar un nuevo producto
export const registrarProducto = async (req, res) => {
    try {
        // ☁️ CLOUDINARY: Quitamos 'imagen' del req.body porque ya no viene como texto
        const { id_comercio, nombre, descripcion, stock, precio } = req.body;
        const idUsuarioAutenticado = req.user.id;

        const precioRegExp = /^\d+(\.\d{1,2})?$/;
        const stockRegExp = /^\d+$/;
        const nombreRegExp = /^[A-Za-zÑñÁáÉéÍíÓóÚú\s'-]{2,50}$/;

        if (!nombreRegExp.test(nombre)) {
            return res.status(400).json({ error: "Nombre inválido. Solo se permiten letras, espacios, guiones y apóstrofes (2-50 caracteres)." });
        }
        if (!precioRegExp.test(String(precio))) {
            return res.status(400).json({ error: "Precio inválido. Debe ser un número positivo (ej: 10.99)." });
        }
        if (!stockRegExp.test(String(stock))) {
            return res.status(400).json({ error: "El stock debe ser un número entero." });
        }

        // ☁️ CLOUDINARY: Capturamos la URL segura que nos devuelve el middleware
        const imagenUrl = req.file ? req.file.path : null;

        // Opcional: Obligar a que el producto tenga foto
        if (!imagenUrl) {
            return res.status(400).json({ error: "Es obligatorio subir una imagen para el producto." });
        }

        // 1. Buscamos el comercio para verificar la propiedad
        const comercio = await getComercioById(id_comercio);

        if (!comercio) {
            return res.status(404).json({ error: "El comercio no existe" });
        }

        // 2. ¿Es el usuario el dueño del comercio?
        if (idUsuarioAutenticado !== comercio.id_usuario) {
            return res.status(403).json({ error: "No tienes permiso para añadir productos a este comercio" });
        }

        // 3. Crear el producto (☁️ CLOUDINARY: Le pasamos imagenUrl)
        const productoId = await createProducto(id_comercio, nombre, descripcion, stock, precio, imagenUrl);

        return res.status(201).json({ 
            id: productoId,
            imagen: imagenUrl, // Devolvemos la URL por si el Front la necesita
            message: "Producto registrado exitosamente" 
        });

    } catch (error) {
        console.error("❌ Error en registrarProducto:", error);
        return res.status(500).json({ error: "Error al registrar el producto" });
    }
};

// Controlador para obtener productos por comercio
export const obtenerProductosPorComercio = async (req, res) => {
    try {
        const { id_comercio } = req.params;
        const productos = await getProductosByComercio(id_comercio);
        return res.status(200).json(productos);
    } catch (error) {
        console.error("❌ Error en obtenerProductosPorComercio:", error);
        return res.status(500).json({ error: "Error al obtener los productos" });
    }
};

// Controlador para obtener un producto por su ID
export const obtenerProductoPorId = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const producto = await getProductoById(id_producto);
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }       
        return res.status(200).json(producto);
    } catch (error) {
        console.error("❌ Error en obtenerProductoPorId:", error);
        return res.status(500).json({ error: "Error al obtener el producto" });
    }   
};

// Funcion para actualizar un producto 
export const actualizarProducto = async (req, res) => {
    try {
        const { id_producto } = req.params; 
        // ☁️ CLOUDINARY: Quitamos 'imagen' del req.body
        const { nombre, descripcion, stock, precio } = req.body; 
        const idUsuarioAutenticado = req.user.id;

        // 1. Buscamos el producto actual para saber a qué comercio pertenece
        const productoExistente = await getProductoById(id_producto);

        if (!productoExistente) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // 2. Validaciones de seguridad...
        const comercio = await getComercioById(productoExistente.id_comercio);

        if (!comercio) {
            return res.status(404).json({ error: "El comercio asociado al producto no existe" });
        }  

        if (idUsuarioAutenticado !== comercio.id_usuario) {
            return res.status(403).json({ error: "No tienes permiso para actualizar este producto" });
        }  

        // ☁️ CLOUDINARY: Lógica de actualización de imagen
        // Si el usuario subió una foto nueva, req.file existirá y usaremos su URL.
        // Si no subió nada, mantenemos la imagen que ya tenía guardada en la base de datos.
        // (Nota: Asegúrate de que 'productoExistente.imagen' coincida con el nombre de tu columna en BD)
        const imagenFinal = req.file ? req.file.path : productoExistente.imagen; 

        // 3. Si todo está bien, procedemos a actualizar el producto
        const filasActualizadas = await updateProducto(id_producto, nombre, descripcion, stock, precio, imagenFinal);
        
        return res.status(200).json({ message: "Producto actualizado exitosamente", filasActualizadas, imagen: imagenFinal });

    } catch (error) {
        console.error("❌ Error en actualizarProducto:", error);
        return res.status(500).json({ error: "Error al actualizar el producto" });
    }
};
    // Funcion para eliminar un producto por su ID
export const eliminarProducto = async (req, res) => {
    try {
        // El ID del producto viene por la URL, no por el body
        const { id_producto } = req.params; 
        // El ID del usuario autenticado lo obtenemos del token
        const idUsuarioAutenticado = req.user.id;
        // 1. Buscamos el producto actual para saber a qué comercio pertenece
        const productoExistente = await getProductoById(id_producto);

        //Validaciones varias para comprobar que no haya fallos de integridad o seguridad
        if (!productoExistente) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }   
        const comercio = await getComercioById(productoExistente.id_comercio);
        if (!comercio) {
            return res.status(404).json({ error: "El comercio asociado al producto no existe" });
        }  
        if (idUsuarioAutenticado !== comercio.id_usuario) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este producto" });
        }   
        const filasEliminadas = await deleteProducto(id_producto);
        if (filasEliminadas === 0) {
            return res.status(404).json({ error: "Producto no encontrado para eliminar" });
        }   
        return res.status(200).json({ message: "Producto eliminado exitosamente", filasEliminadas });
    } catch (error) {
        console.error("❌ Error en eliminarProducto:", error);
        return res.status(500).json({ error: "Error al eliminar el producto" });
    }
};
