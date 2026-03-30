import { Router } from "express";
import { getMisPedidos,simularPedido } from "../controllers/pedidoController.js";

const router = Router();

router.post('/crear', simularPedido);

router.get('/usuario/:id_usuario', getMisPedidos);

export default router;