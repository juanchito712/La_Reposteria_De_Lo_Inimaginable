const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito_controller');

// Sin autenticación - El cliente_id viene en el body o query

// GET /api/carrito - Obtener carrito del usuario
router.get('/', carritoController.obtenerCarrito);

// POST /api/carrito/agregar - Agregar producto al carrito
router.post('/agregar', carritoController.agregarAlCarrito);

// PUT /api/carrito/item/:itemId - Actualizar cantidad de un item
router.put('/item/:itemId', carritoController.actualizarCantidad);

// DELETE /api/carrito/item/:itemId - Eliminar item del carrito
router.delete('/item/:itemId', carritoController.eliminarItem);

// DELETE /api/carrito/vaciar - Vaciar carrito
router.delete('/vaciar', carritoController.vaciarCarrito);

// POST /api/carrito/checkout - Procesar checkout
router.post('/checkout', carritoController.procesarCheckout);

module.exports = router;
