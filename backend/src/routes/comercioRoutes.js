import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { registrarComercio, obtenerComercioPorId, obtenerTodosLosComercios } from "../controllers/comercioController.js"; // Añadimos el nuevo controlador

const router = Router();    

// Ruta protegida para registrar un nuevo comercio
// POST /api/comercios/
router.post("/", authMiddleware, registrarComercio);

// NUEVA RUTA PÚBLICA: Obtener los datos de un comercio por su ID
// GET /api/comercios/:id
router.get("/:id", obtenerComercioPorId);

// NUEVA RUTA PÚBLICA: Obtener todos los comercios
// GET /api/comercios/
router.get("/", obtenerTodosLosComercios);

export default router;