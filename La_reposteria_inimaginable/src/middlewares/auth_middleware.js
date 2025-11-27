import jwt from 'jsonwebtoken';
import ClienteModel from '../models/cliente_model.js';

// Verificar que el usuario esté autenticado
export const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No se proporcionó token de autenticación'
            });
        }

        // Validar que JWT_SECRET esté configurado
        if (!process.env.JWT_SECRET) {
            console.error('ERROR CRÍTICO: JWT_SECRET no está configurado en .env');
            return res.status(500).json({
                success: false,
                error: 'Error de configuración del servidor'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Obtener usuario de la base de datos
        const usuario = await ClienteModel.getById(decoded.id);
        
        if (!usuario) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Agregar usuario a la request
        req.usuario = usuario;
        next();
    } catch (error) {
        console.error('Error verificando token:', error);
        return res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};

// Verificar que el usuario sea administrador
export const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requieren privilegios de administrador.'
        });
    }
    next();
};

// Middleware combinado: autenticación + autorización admin
export const soloAdmin = [verificarToken, verificarAdmin];
