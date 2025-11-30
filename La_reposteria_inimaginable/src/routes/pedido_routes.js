import express from 'express';
import {
    getPedidos,
    getPedidoById,
    createPedido,
    updatePedidoEstado,
    cancelPedido,
    getPedidosByCliente,
    getEstadisticas
} from '../controllers/pedidos_controller.js';
import validarPedido from '../middlewares/validar_pedido_middleware.js';

const router = express.Router();

// Rutas públicas
router.post('/', validarPedido, createPedido);                       // POST /api/pedidos (con validación)
router.get('/cliente/:cliente_id', getPedidosByCliente);             // GET /api/pedidos/cliente/1

// Rutas admin
router.get('/', getPedidos);                                         // GET /api/pedidos
router.get('/estadisticas', getEstadisticas);                        // GET /api/pedidos/estadisticas
router.get('/:id', getPedidoById);                                   // GET /api/pedidos/1
router.put('/:id/estado', updatePedidoEstado);                       // PUT /api/pedidos/1/estado
router.delete('/:id', cancelPedido);                                 // DELETE /api/pedidos/1

export default router;
