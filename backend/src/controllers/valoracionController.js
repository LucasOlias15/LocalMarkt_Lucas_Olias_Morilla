import {
    verificarCompra,
    upsertValoracion,
    getValoracionesTienda,
    getPromedioTienda,
    getValoracionesByComercio,
    getValoracionUsuario,
    getEstadisticasValoraciones,
    deleteValoracion
} from "../models/valoracionModel.js";
import { getComercioById } from "../models/comercioModel.js";

export const valorar = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { id_comercio, id_producto, puntuacion, comentario } = req.body;

        if (!id_comercio) {
            return res.status(400).json({ error: "El id_comercio es obligatorio" });
        }

        if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
            return res.status(400).json({ error: "La puntuación debe estar entre 1 y 5" });
        }

        if (comentario && comentario.length > 250) {
            return res.status(400).json({ error: "El comentario no puede superar los 250 caracteres" });
        }

        const comercio = await getComercioById(id_comercio);
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        const haComprado = await verificarCompra(id_usuario, id_comercio, id_producto || null);
        if (!haComprado) {
            return res.status(403).json({ error: "Solo puedes valorar comercios o productos que hayas comprado" });
        }

        if (req.user.rol === 'dueño' && req.user.id_comercio === id_comercio) {
            return res.status(403).json({ error: "No puedes valorar tu propio comercio" });
        }

        const result = await upsertValoracion(
            id_usuario,
            id_comercio,
            id_producto || null,
            puntuacion,
            comentario || null
        );

        return res.status(200).json({
            message: result.updated ? "Valoración actualizada correctamente" : "Valoración creada correctamente",
            id: result.id,
            updated: result.updated
        });

    } catch (error) {
        console.error("❌ Error en controlador valorar:", error);
        return res.status(500).json({ error: "Error al guardar la valoración" });
    }
};

export const obtenerValoracionesComercio = async (req, res) => {
    try {
        const { id_comercio } = req.params;

        const comercio = await getComercioById(id_comercio);
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        const valoraciones = await getValoracionesTienda(id_comercio);
        const { promedio, total } = await getPromedioTienda(id_comercio);

        return res.status(200).json({
            valoraciones,
            promedio,
            total,
            mostrarPromedio: total >= 5
        });

    } catch (error) {
        console.error("❌ Error en controlador obtenerValoracionesComercio:", error);
        return res.status(500).json({ error: "Error al obtener valoraciones" });
    }
};

export const obtenerTodasValoracionesComercio = async (req, res) => {
    try {
        const { id_comercio } = req.params;
        const id_usuario = req.user.id;

        const comercio = await getComercioById(id_comercio);
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        if (comercio.id_usuario !== id_usuario) {
            return res.status(403).json({ error: "No tienes permiso para ver estas valoraciones" });
        }

        const valoraciones = await getValoracionesByComercio(id_comercio);
        const { promedio, total } = await getPromedioTienda(id_comercio);

        return res.status(200).json({ valoraciones, promedio, total });

    } catch (error) {
        console.error("❌ Error en controlador obtenerTodasValoracionesComercio:", error);
        return res.status(500).json({ error: "Error al obtener valoraciones" });
    }
};

export const obtenerEstadisticas = async (req, res) => {
    try {
        const { id_comercio } = req.params;
        const id_usuario = req.user.id;

        const comercio = await getComercioById(id_comercio);
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        if (comercio.id_usuario !== id_usuario) {
            return res.status(403).json({ error: "No tienes permiso para ver estas estadísticas" });
        }

        const estadisticas = await getEstadisticasValoraciones(id_comercio);
        return res.status(200).json(estadisticas);

    } catch (error) {
        console.error("❌ Error en controlador obtenerEstadisticas:", error);
        return res.status(500).json({ error: "Error al obtener estadísticas" });
    }
};

export const obtenerMiValoracion = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { id_comercio, id_producto } = req.query;

        if (!id_comercio) {
            return res.status(400).json({ error: "id_comercio es obligatorio" });
        }

        const valoracion = await getValoracionUsuario(
            id_usuario,
            parseInt(id_comercio),
            id_producto ? parseInt(id_producto) : null
        );

        const haComprado = await verificarCompra(
            id_usuario,
            parseInt(id_comercio),
            id_producto ? parseInt(id_producto) : null
        );

        return res.status(200).json({
            valoracion: valoracion || null,
            haComprado,
            puedeValorar: haComprado && req.user.rol !== 'dueño'
        });

    } catch (error) {
        console.error("❌ Error en controlador obtenerMiValoracion:", error);
        return res.status(500).json({ error: "Error al obtener tu valoración" });
    }
};

export const eliminarValoracion = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { id_valoracion } = req.params;

        const success = await deleteValoracion(parseInt(id_valoracion), id_usuario);

        if (!success) {
            return res.status(404).json({ error: "Valoración no encontrada o no tienes permiso para eliminarla" });
        }

        return res.status(200).json({ message: "Valoración eliminada correctamente" });

    } catch (error) {
        console.error("❌ Error en controlador eliminarValoracion:", error);
        return res.status(500).json({ error: "Error al eliminar la valoración" });
    }
};

// En valoracionController.js
export const obtenerMisValoraciones = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const [rows] = await pool.query(
            `SELECT v.*, c.nombre as nombre_comercio, p.nombre as nombre_producto
             FROM valoracion v
             JOIN comercio c ON v.id_comercio = c.id_comercio
             LEFT JOIN producto p ON v.id_producto = p.id_producto
             WHERE v.id_usuario = ?
             ORDER BY v.fecha DESC`,
            [id_usuario]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error en obtenerMisValoraciones:", error);
        return res.status(500).json({ error: "Error al obtener valoraciones" });
    }
};

