import { Router } from "express";
import { getMisPedidos } from "../controllers/pedidoController.js";

const router = Router();

router.get('/usuario/:id_usuario', getMisPedidos);

export default router;