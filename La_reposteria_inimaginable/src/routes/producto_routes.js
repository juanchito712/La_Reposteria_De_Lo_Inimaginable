import express from 'express';
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosByCategoria,
    getProductosDestacados,
    searchProductos
} from '../controllers/productos_controller.js';
import { upload, processImage } from '../config/multer.js';

const router = express.Router();// Rutas públicas
router.get('/', getProductos);                              // GET /api/productos
router.get('/destacados', getProductosDestacados);          // GET /api/productos/destacados
router.get('/search', searchProductos);                     // GET /api/productos/search?q=termo
router.get('/categoria/:categoria_id', getProductosByCategoria); // GET /api/productos/categoria/1
router.get('/:id', getProductoById);                        // GET /api/productos/1

// Rutas admin (después agregaremos middleware de auth)
router.post('/', upload.single('imagen'), processImage, createProducto);        // POST /api/productos
router.put('/:id', upload.single('imagen'), processImage, updateProducto);      // PUT /api/productos/1
router.delete('/:id', deleteProducto);                                           // DELETE /api/productos/1

export default router;
