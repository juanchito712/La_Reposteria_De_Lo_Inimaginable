import nodemailer from 'nodemailer';

// Configurar transportador de email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu_email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'tu_contraseña_app'
    }
});

// Enviar email de confirmación de pedido
export const enviarConfirmacionPedido = async (pedidoData) => {
    try {
        const { numero_pedido, cliente_email, cliente_nombre, items, total, fecha } = pedidoData;

        // Construir tabla de productos
        let productosHTML = `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: left;">Producto</td>
                <td style="padding: 10px; text-align: center;">Cantidad</td>
                <td style="padding: 10px; text-align: right;">Precio Unitario</td>
                <td style="padding: 10px; text-align: right;">Subtotal</td>
            </tr>
        `;

        items.forEach(item => {
            productosHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; text-align: left;">${item.nombre}</td>
                    <td style="padding: 10px; text-align: center;">${item.cantidad}</td>
                    <td style="padding: 10px; text-align: right;">$${parseFloat(item.precio).toLocaleString('es-CO')}</td>
                    <td style="padding: 10px; text-align: right;">$${(item.cantidad * item.precio).toLocaleString('es-CO')}</td>
                </tr>
            `;
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
                    .total-row { font-weight: bold; background: #f0f0f0; }
                    .btn { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎂 ¡Pedido Confirmado!</h1>
                        <p>La Repostería de lo Inimaginable</p>
                    </div>

                    <div class="content">
                        <p>¡Hola <strong>${cliente_nombre}</strong>!</p>
                        <p>Gracias por tu compra. Aquí están los detalles de tu pedido:</p>

                        <table>
                            <tr style="background: #f5f5f5; font-weight: bold;">
                                <td style="padding: 10px;">📦 Número de Pedido:</td>
                                <td style="padding: 10px; text-align: right;"><strong>#${numero_pedido}</strong></td>
                            </tr>
                            <tr style="background: #f5f5f5;">
                                <td style="padding: 10px;">📅 Fecha:</td>
                                <td style="padding: 10px; text-align: right;">${new Date(fecha).toLocaleDateString('es-CO')}</td>
                            </tr>
                        </table>

                        <h3 style="margin-top: 20px; margin-bottom: 10px;">Detalles de tu Compra:</h3>
                        <table style="border: 1px solid #ddd;">
                            ${productosHTML}
                            <tr class="total-row" style="font-size: 18px; background: #e8e8e8;">
                                <td colspan="3" style="padding: 15px; text-align: right;">TOTAL:</td>
                                <td style="padding: 15px; text-align: right; color: #667eea;">$${parseFloat(total).toLocaleString('es-CO')}</td>
                            </tr>
                        </table>

                        <p style="margin-top: 20px; color: #666;">
                            <strong>Estado del Pedido:</strong> Pendiente de Confirmación
                        </p>

                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            Tu pedido será preparado con cuidado. Te notificaremos cuando esté listo para recoger o entregar.
                        </p>
                    </div>

                    <div class="footer">
                        <p>© 2025 La Repostería de lo Inimaginable. Todos los derechos reservados.</p>
                        <p>Si tienes dudas, contáctanos: info@reposteria.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'reposteria@example.com',
            to: cliente_email,
            subject: `🎂 Pedido Confirmado - Repostería Inimaginable #${numero_pedido}`,
            html: htmlContent
        });

        console.log(`✅ Email de confirmación enviado a ${cliente_email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return false;
    }
};

// Enviar email de cambio de estado
export const enviarCambioEstado = async (pedidoData) => {
    try {
        const { numero_pedido, cliente_email, cliente_nombre, estado } = pedidoData;

        const estadoMensajes = {
            confirmado: 'Tu pedido ha sido confirmado',
            en_preparacion: 'Tu pedido está siendo preparado',
            listo: 'Tu pedido está listo para recoger',
            entregado: 'Tu pedido ha sido entregado',
            cancelado: 'Tu pedido ha sido cancelado'
        };

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📦 Actualización de tu Pedido</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${cliente_nombre}</strong>,</p>
                        <p>${estadoMensajes[estado] || 'Tu pedido ha sido actualizado'}</p>
                        <p><strong>Número de Pedido:</strong> #${numero_pedido}</p>
                        <p><strong>Estado:</strong> ${estado.toUpperCase()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: cliente_email,
            subject: `Actualización: Pedido #${numero_pedido}`,
            html: htmlContent
        });

        console.log(`✅ Email de actualización enviado a ${cliente_email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de actualización:', error);
        return false;
    }
};
