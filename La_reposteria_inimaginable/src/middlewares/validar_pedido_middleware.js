/**
 * Middleware para validar los datos de un pedido antes de procesarlo
 * Validaciones completas: teléfono, dirección, productos, etc.
 */

export const validarPedido = (req, res, next) => {
    try {
        const pedidoData = req.body;

        // ============ VALIDACIONES COMPLETAS ============

        // 1. Validar cliente_id
        if (!pedidoData.cliente_id) {
            return res.status(400).json({
                success: false,
                error: 'El cliente_id es requerido'
            });
        }

        if (!Number.isInteger(pedidoData.cliente_id) || pedidoData.cliente_id <= 0) {
            return res.status(400).json({
                success: false,
                error: 'El cliente_id debe ser un número válido y positivo'
            });
        }

        // 2. Validar productos
        if (!pedidoData.productos || !Array.isArray(pedidoData.productos) || pedidoData.productos.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Debe incluir al menos un producto en el pedido'
            });
        }

        // 3. Validar cada producto
        for (let i = 0; i < pedidoData.productos.length; i++) {
            const prod = pedidoData.productos[i];

            if (!prod.producto_id || !Number.isInteger(prod.producto_id) || prod.producto_id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: `El producto ${i + 1} tiene un producto_id inválido`
                });
            }

            if (!prod.cantidad || !Number.isInteger(prod.cantidad) || prod.cantidad < 1) {
                return res.status(400).json({
                    success: false,
                    error: `La cantidad del producto ${i + 1} debe ser un número entero mayor a 0`
                });
            }

            if (prod.cantidad > 100) {
                return res.status(400).json({
                    success: false,
                    error: `La cantidad del producto ${i + 1} no puede exceder 100 unidades`
                });
            }

            if (!prod.precio_unitario || isNaN(prod.precio_unitario) || prod.precio_unitario < 0) {
                return res.status(400).json({
                    success: false,
                    error: `El precio unitario del producto ${i + 1} es inválido`
                });
            }
        }

        // 4. Validar dirección de entrega
        if (!pedidoData.direccion_entrega || typeof pedidoData.direccion_entrega !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'La dirección de entrega es requerida'
            });
        }

        const direccionTrimmed = pedidoData.direccion_entrega.trim();
        if (direccionTrimmed.length < 5) {
            return res.status(400).json({
                success: false,
                error: 'La dirección debe tener al menos 5 caracteres'
            });
        }

        if (direccionTrimmed.length > 255) {
            return res.status(400).json({
                success: false,
                error: 'La dirección no puede exceder 255 caracteres'
            });
        }

        // 5. Validar teléfono
        if (!pedidoData.telefono || typeof pedidoData.telefono !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'El teléfono de contacto es requerido'
            });
        }

        // Eliminar caracteres no numéricos
        const soloDigitos = pedidoData.telefono.replace(/\D/g, '');

        if (soloDigitos.length < 7) {
            return res.status(400).json({
                success: false,
                error: 'El teléfono debe tener al menos 7 dígitos'
            });
        }

        if (soloDigitos.length > 10) {
            return res.status(400).json({
                success: false,
                error: 'El teléfono no puede tener más de 10 dígitos'
            });
        }

        // 6. Validar total
        if (pedidoData.total === undefined || isNaN(pedidoData.total) || pedidoData.total < 0) {
            return res.status(400).json({
                success: false,
                error: 'El total es inválido'
            });
        }

        // 7. Validar notas (opcional pero con límite)
        if (pedidoData.notas && typeof pedidoData.notas === 'string') {
            if (pedidoData.notas.length > 500) {
                return res.status(400).json({
                    success: false,
                    error: 'Las notas no pueden exceder 500 caracteres'
                });
            }
        }

        // ============ NORMALIZAR Y PASAR AL SIGUIENTE MIDDLEWARE ============

        // Normalizar datos
        req.body.direccion_entrega = direccionTrimmed;
        req.body.telefono = soloDigitos;
        if (pedidoData.notas) {
            req.body.notas = pedidoData.notas.trim();
        }

        next();
    } catch (error) {
        console.error('Error en validación de pedido:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno en la validación del pedido'
        });
    }
};

export default validarPedido;
