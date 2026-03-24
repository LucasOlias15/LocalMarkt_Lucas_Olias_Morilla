import { Router } from "express";
import { toggleFavorito, getFavoritos } from "../controllers/favoritoController.js";

const router = Router();

// Esta ruta para añadir/quitar producto de favoritos 
router.post("/toggleFavs", toggleFavorito);

// Ruta para traer los favoritos del usuario 
router.get("/:id_usuario", getFavoritos);

export default router;