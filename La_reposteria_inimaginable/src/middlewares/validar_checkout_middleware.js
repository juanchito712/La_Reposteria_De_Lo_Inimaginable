/**
 * Middleware para validar los datos de checkout desde el carrito
 * Validaciones para teléfono, dirección, etc.
 */

export const validarCheckout = (req, res, next) => {
    try {
        const { direccion_entrega, telefono, notas } = req.body;

        // ============ VALIDACIONES COMPLETAS ============

        // 1. Validar dirección de entrega
        if (!direccion_entrega || typeof direccion_entrega !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'La dirección de entrega es requerida'
            });
        }

        const direccionTrimmed = direccion_entrega.trim();
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

        // 2. Validar teléfono
        if (!telefono || typeof telefono !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'El teléfono de contacto es requerido'
            });
        }

        const soloDigitos = telefono.replace(/\D/g, '');
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

        // 3. Validar notas (opcional pero con límite)
        if (notas && typeof notas === 'string') {
            if (notas.length > 500) {
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
        if (notas) {
            req.body.notas = notas.trim();
        }

        next();
    } catch (error) {
        console.error('Error en validación de checkout:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno en la validación del checkout'
        });
    }
};

export default validarCheckout;
