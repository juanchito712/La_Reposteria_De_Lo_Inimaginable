import ProductoModel from '../models/producto_model.js';

// Obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const productos = await ProductoModel.getAll();
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los productos'
        });
    }
};

// Obtener producto por ID
export const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await ProductoModel.getById(id);
        
        if (!producto) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: producto
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el producto'
        });
    }
};

// Crear nuevo producto
export const createProducto = async (req, res) => {
    try {
        const productoData = req.body;
        
        // Si se subió una imagen, agregar el nombre del archivo
        if (req.file) {
            productoData.imagen = req.file.processedFilename || req.file.filename;
        }
        
        // Validar datos requeridos
        if (!productoData.nombre || !productoData.precio || !productoData.categoria_id) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, precio y categoría son requeridos'
            });
        }
        
        const productoId = await ProductoModel.create(productoData);
        
        res.status(201).json({
            success: true,
            data: { id: productoId, message: 'Producto creado exitosamente' }
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear el producto'
        });
    }
};

// Actualizar producto
export const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoData = req.body;
        
        // Si se subió una nueva imagen, agregar el nombre del archivo
        if (req.file) {
            productoData.imagen = req.file.processedFilename || req.file.filename;
        }
        
        const result = await ProductoModel.update(id, productoData);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: { message: 'Producto actualizado exitosamente' }
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el producto'
        });
    }
};

// Eliminar producto
export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await ProductoModel.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: { message: 'Producto eliminado exitosamente' }
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar el producto'
        });
    }
};

// Obtener productos por categoría
export const getProductosByCategoria = async (req, res) => {
    try {
        const { categoria_id } = req.params;
        console.log('🔍 Buscando productos de categoría:', categoria_id);
        
        const productos = await ProductoModel.getByCategoria(categoria_id);
        console.log(`✅ Encontrados ${productos.length} productos`);
        
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los productos'
        });
    }
};

// Obtener productos destacados
export const getProductosDestacados = async (req, res) => {
    try {
        const productos = await ProductoModel.getDestacados();
        
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los productos destacados'
        });
    }
};

// Buscar productos
export const searchProductos = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Parámetro de búsqueda requerido'
            });
        }
        
        const productos = await ProductoModel.search(q);
        
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al buscar productos'
        });
    }
};
