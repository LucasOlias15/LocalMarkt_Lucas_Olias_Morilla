import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    valorar,
    obtenerValoracionesComercio,
    obtenerTodasValoracionesComercio,
    obtenerEstadisticas,
    obtenerMiValoracion,
    eliminarValoracion,
    obtenerMisValoraciones
} from "../controllers/valoracionController.js";

const router = Router();

// PÚBLICAS
// GET /api/comercio/id (público)
router.get("/comercio/:id_comercio", obtenerValoracionesComercio);
router.get("/mis-valoraciones/:id_usuario", obtenerMisValoraciones);

// PROTEGIDAS
router.post("/", authMiddleware, valorar);

// GET /api/
router.get("/mi-valoracion", authMiddleware, obtenerMiValoracion);
router.get("/comercio/:id_comercio/todas", authMiddleware, obtenerTodasValoracionesComercio);
router.get("/comercio/:id_comercio/estadisticas", authMiddleware, obtenerEstadisticas);
router.delete("/:id_valoracion", authMiddleware, eliminarValoracion);

export default router;