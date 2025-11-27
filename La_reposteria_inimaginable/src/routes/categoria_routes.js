import express from 'express';
import {
    getCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriaWithProducts
} from '../controllers/categorias_controller.js';

const router = express.Router();

// Rutas públicas
router.get('/', getCategorias);                             // GET /api/categorias
router.get('/:id', getCategoriaById);                       // GET /api/categorias/1
router.get('/:id/productos', getCategoriaWithProducts);     // GET /api/categorias/1/productos

// Rutas admin
router.post('/', createCategoria);                          // POST /api/categorias
router.put('/:id', updateCategoria);                        // PUT /api/categorias/1
router.delete('/:id', deleteCategoria);                     // DELETE /api/categorias/1

export default router;
