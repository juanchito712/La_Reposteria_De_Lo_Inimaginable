import ClienteModel from '../models/cliente_model.js';
import bcrypt from 'bcrypt';

// Obtener todos los clientes (solo admin)
const getClientes = async (req, res) => {
    try {
        const clientes = await ClienteModel.getAll();
        res.json({
            success: true,
            data: clientes,
            total: clientes.length
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener clientes' 
        });
    }
};

// Obtener cliente por ID
const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await ClienteModel.getById(id);
        
        if (!cliente) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener cliente' 
        });
    }
};

// Actualizar cliente
const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await ClienteModel.update(id, req.body);
        
        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al actualizar cliente' 
        });
    }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        // Obtener cliente con password
        const cliente = await ClienteModel.getById(id);
        
        if (!cliente) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        // Verificar contraseña actual
        const validPassword = await bcrypt.compare(currentPassword, cliente.password);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                error: 'Contraseña actual incorrecta' 
            });
        }
        
        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await ClienteModel.updatePassword(id, hashedPassword);
        
        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al cambiar contraseña' 
        });
    }
};

// Eliminar cliente
const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await ClienteModel.delete(id);
        
        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al eliminar cliente' 
        });
    }
};

export {
    getClientes,
    getClienteById,
    updateCliente,
    changePassword,
    deleteCliente
};
