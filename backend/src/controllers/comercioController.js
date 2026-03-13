import { createComercio, getComercioById , getAllComercios} from "../models/comercioModel.js";

// Controlador existente para registrar
export const registrarComercio = async (req, res) => {
    try {
        const { nombre, descripcion, categoria, contacto, direccion } = req.body;
        const idUsuario = req.user.id; 
        const comercioId = await createComercio(nombre, idUsuario, descripcion, categoria, contacto, direccion);
        return res.status(201).json({ 
            id: comercioId,
            message: "Comercio registrado exitosamente" 
        });
    } catch (error) {
        console.error("❌ Error real en el servidor:", error); 
        return res.status(500).json({ error: "Error al registrar el comercio" });
    }
};

// NUEVO CONTROLADOR: Obtener comercio por ID
export const obtenerComercioPorId = async (req, res) => {
    try {
        const { id } = req.params; // Sacamos el ID de la URL
        const comercio = await getComercioById(id);
        
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }
        
        return res.status(200).json(comercio);
    } catch (error) {
        console.error("❌ Error en obtenerComercioPorId:", error); 
        return res.status(500).json({ error: "Error al obtener la información del comercio" });
    }
};

// Controlador para obtener todos los comercios
export const obtenerTodosLosComercios = async (req,res) => {
    try {
        const comercios = await getAllComercios();
        return res.status(200).json(comercios);
    } catch (error) {
        console.error("❌ Error en obtenerTodosLosComercios:", error);
        return res.status(500).json({ error: "Error al obtener los comercios" });
    }
};