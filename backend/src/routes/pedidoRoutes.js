import { Router } from "express";
import { getMisPedidos, simularPedido, getPedidosPorComercio, updateEstadoPedido } from "../controllers/pedidoController.js";

const router = Router();

// Rutas de creación
router.post('/crear', simularPedido);

// Rutas para el cliente (Comprador)
router.get('/usuario/:id_usuario', getMisPedidos);

// Rutas para el comercio (Vendedor)
router.get('/comercio/:id_comercio', getPedidosPorComercio);
router.put('/:id_pedido/estado', updateEstadoPedido);

export default router;