import CarritoModel from '../models/carrito_model.js';
import ProductoModel from '../models/producto_model.js';
import PedidoModel from '../models/pedido_model.js';
import ClienteModel from '../models/cliente_model.js';
import { enviarConfirmacionPedido } from '../utils/mailer.js';

// Obtener carrito del usuario
export const getCarrito = async (req, res) => {
    try {
        const cliente_id = req.usuario.id;
        const carrito = await CarritoModel.getCarritoDetallado(cliente_id);

        res.json({
            success: true,
            data: carrito
        });
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el carrito'
        });
    }
};

// Agregar producto al carrito
export const agregarProducto = async (req, res) => {
    try {
        const cliente_id = req.usuario.id;
        const { producto_id, cantidad = 1 } = req.body;

        // Validar que el producto existe
        const producto = await ProductoModel.getById(producto_id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        // Validar stock
        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                error: 'Stock insuficiente'
            });
        }

        // Agregar al carrito
        const itemId = await CarritoModel.agregarProducto(cliente_id, producto_id, cantidad);

        res.json({
            success: true,
            message: 'Producto agregado al carrito',
            data: { id: itemId }
        });
    } catch (error) {
        console.error('Error agregando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al agregar producto'
        });
    }
};

// Actualizar cantidad
export const actualizarCantidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;

        if (!cantidad || cantidad < 1) {
            return res.status(400).json({
                success: false,
                error: 'Cantidad inválida'
            });
        }

        const result = await CarritoModel.actualizarCantidad(id, cantidad);

        if (result === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Cantidad actualizada'
        });
    } catch (error) {
        console.error('Error actualizando cantidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar cantidad'
        });
    }
};

// Eliminar producto del carrito
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await CarritoModel.eliminarItem(id);

        if (result === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Producto eliminado del carrito'
        });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar producto'
        });
    }
};

// Vaciar carrito
export const vaciarCarrito = async (req, res) => {
    try {
        const cliente_id = req.usuario.id;

        await CarritoModel.vaciarCarrito(cliente_id);

        res.json({
            success: true,
            message: 'Carrito vaciado'
        });
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        res.status(500).json({
            success: false,
            error: 'Error al vaciar carrito'
        });
    }
};

// Procesar compra (Checkout)
export const checkout = async (req, res) => {
    try {
        const cliente_id = req.usuario.id;

        // Obtener carrito del usuario
        const carrito = await CarritoModel.getCarritoDetallado(cliente_id);

        if (carrito.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El carrito está vacío'
            });
        }

        // Obtener datos del cliente
        const cliente = await ClienteModel.getById(cliente_id);

        // Crear pedido
        const pedidoId = await PedidoModel.create({
            cliente_id,
            total: carrito.total,
            estado: 'pendiente',
            notas: req.body.notas || ''
        });

        // Agregar items del carrito al pedido (detalles)
        for (const item of carrito.items) {
            await PedidoModel.agregarDetalle(pedidoId, {
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio
            });
        }

        // Vaciar carrito
        await CarritoModel.vaciarCarrito(cliente_id);

        // Enviar email de confirmación
        const pedidoData = {
            numero_pedido: pedidoId,
            cliente_email: cliente.email,
            cliente_nombre: cliente.nombre,
            items: carrito.items,
            total: carrito.total,
            fecha: new Date()
        };

        await enviarConfirmacionPedido(pedidoData);

        res.json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: {
                pedido_id: pedidoId,
                total: carrito.total,
                estado: 'pendiente'
            }
        });
    } catch (error) {
        console.error('Error en checkout:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la compra'
        });
    }
};
