import express from 'express';
import {
    getDashboardStats,
    getUsuarios,
    updateUsuarioRol,
    deleteUsuario,
    updateEstadoPedido,
    getTodosPedidos,
    getReporteVentas
} from '../controllers/admin_controller.js';
import { soloAdmin } from '../middlewares/auth_middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(soloAdmin);

// ===== DASHBOARD =====
router.get('/dashboard/stats', getDashboardStats);          // GET /api/admin/dashboard/stats

// ===== USUARIOS =====
router.get('/usuarios', getUsuarios);                       // GET /api/admin/usuarios
router.put('/usuarios/:id/rol', updateUsuarioRol);          // PUT /api/admin/usuarios/1/rol
router.delete('/usuarios/:id', deleteUsuario);              // DELETE /api/admin/usuarios/1

// ===== PEDIDOS =====
router.get('/pedidos', getTodosPedidos);                    // GET /api/admin/pedidos
router.put('/pedidos/:id/estado', updateEstadoPedido);      // PUT /api/admin/pedidos/1/estado

// ===== REPORTES =====
router.get('/reportes/ventas', getReporteVentas);           // GET /api/admin/reportes/ventas?fecha_inicio=2025-01-01&fecha_fin=2025-12-31

export default router;
