import CategoriaModel from '../models/categoria_model.js';

// Obtener todas las categorías
const getCategorias = async (req, res) => {
    try {
        const categorias = await CategoriaModel.getAll();
        res.json({
            success: true,
            data: categorias,
            total: categorias.length
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener categorías' 
        });
    }
};

// Obtener categoría por ID
const getCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await CategoriaModel.getById(id);
        
        if (!categoria) {
            return res.status(404).json({ 
                success: false,
                error: 'Categoría no encontrada' 
            });
        }
        
        res.json({
            success: true,
            data: categoria
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener categoría' 
        });
    }
};

// Crear categoría
const createCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ 
                success: false,
                error: 'El nombre es requerido' 
            });
        }
        
        const categoriaId = await CategoriaModel.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: { id: categoriaId }
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al crear categoría' 
        });
    }
};

// Actualizar categoría
const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await CategoriaModel.update(id, req.body);
        
        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Categoría no encontrada' 
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al actualizar categoría' 
        });
    }
};

// Eliminar categoría
const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await CategoriaModel.delete(id);
        
        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Categoría no encontrada' 
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al eliminar categoría' 
        });
    }
};

// Obtener categoría con sus productos
const getCategoriaWithProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await CategoriaModel.getWithProducts(id);
        
        if (!categoria) {
            return res.status(404).json({ 
                success: false,
                error: 'Categoría no encontrada' 
            });
        }
        
        res.json({
            success: true,
            data: categoria
        });
    } catch (error) {
        console.error('Error al obtener categoría con productos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener categoría' 
        });
    }
};

export {
    getCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriaWithProducts
};
