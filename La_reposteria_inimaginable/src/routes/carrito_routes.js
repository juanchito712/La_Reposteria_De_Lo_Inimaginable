import express from 'express';
import { 
    getCarrito, 
    agregarProducto, 
    actualizarCantidad, 
    eliminarProducto, 
    vaciarCarrito, 
    checkout 
} from '../controllers/carrito_controller.js';
import { verificarToken } from '../middlewares/auth_middleware.js';
import validarCheckout from '../middlewares/validar_checkout_middleware.js';

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
router.use(verificarToken);

// POST /api/carrito/checkout - Procesar compra (con validación) - DEBE IR PRIMERO
router.post('/checkout', validarCheckout, checkout);

// GET  /api/carrito           - Obtener carrito
router.get('/', getCarrito);

// POST /api/carrito           - Agregar producto al carrito
router.post('/', agregarProducto);

// PUT  /api/carrito/:id       - Actualizar cantidad
router.put('/:id', actualizarCantidad);

// DELETE /api/carrito/:id    - Eliminar producto del carrito
router.delete('/:id', eliminarProducto);

// DELETE /api/carrito/vaciar - Vaciar carrito
router.delete('/vaciar/all', vaciarCarrito);

export default router;
