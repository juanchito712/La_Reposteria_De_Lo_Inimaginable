import PedidoModel from '../models/pedido_model.js';

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
    try {
        const pedidos = await PedidoModel.getAll();
        res.json({
            success: true,
            data: pedidos
        });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los pedidos'
        });
    }
};

// Obtener pedido por ID
export const getPedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await PedidoModel.getById(id);
        
        if (!pedido) {
            return res.status(404).json({
                success: false,
                error: 'Pedido no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: pedido
        });
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el pedido'
        });
    }
};

// Crear nuevo pedido
export const createPedido = async (req, res) => {
    try {
        const pedidoData = req.body;
        
        // Validar datos requeridos
        if (!pedidoData.cliente_id || !pedidoData.productos || pedidoData.productos.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos para crear el pedido'
            });
        }
        
        // Convertir 'productos' a 'detalles' con el formato correcto
        const pedidoCompleto = {
            cliente_id: pedidoData.cliente_id,
            total: pedidoData.total || 0,
            direccion_entrega: pedidoData.direccion_entrega,
            telefono_entrega: pedidoData.telefono || null,
            notas: pedidoData.notas || null,
            detalles: pedidoData.productos.map(prod => ({
                producto_id: prod.producto_id,
                cantidad: prod.cantidad,
                precio_unitario: prod.precio_unitario,
                subtotal: prod.cantidad * prod.precio_unitario
            }))
        };
        
        const pedidoId = await PedidoModel.create(pedidoCompleto);
        
        res.status(201).json({
            success: true,
            data: { id: pedidoId, message: 'Pedido creado exitosamente' }
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al crear el pedido'
        });
    }
};

// Actualizar estado del pedido
export const updatePedidoEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        if (!estado) {
            return res.status(400).json({
                success: false,
                error: 'Estado requerido'
            });
        }
        
        const result = await PedidoModel.updateEstado(id, estado);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pedido no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: { message: 'Estado del pedido actualizado' }
        });
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el estado del pedido'
        });
    }
};

// Cancelar pedido
export const cancelPedido = async (req, res) => {
    try {
        const { id } = req.params;
        
        await PedidoModel.cancel(id);
        
        res.json({
            success: true,
            data: { message: 'Pedido cancelado exitosamente' }
        });
    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al cancelar el pedido'
        });
    }
};

// Obtener pedidos por cliente
export const getPedidosByCliente = async (req, res) => {
    try {
        const { cliente_id } = req.params;
        const pedidos = await PedidoModel.getByCliente(cliente_id);
        
        res.json({
            success: true,
            data: pedidos
        });
    } catch (error) {
        console.error('Error al obtener pedidos del cliente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los pedidos del cliente'
        });
    }
};

// Obtener estadísticas
export const getEstadisticas = async (req, res) => {
    try {
        const estadisticas = await PedidoModel.getEstadisticas();
        
        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las estadísticas'
        });
    }
};
