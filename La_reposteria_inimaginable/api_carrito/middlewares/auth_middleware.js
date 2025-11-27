const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const [usuarios] = await db.query(
      'SELECT id_cliente, email, rol, activo FROM cliente WHERE id_cliente = ?',
      [decoded.id]
    );

    if (usuarios.length === 0 || !usuarios[0].activo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no válido o inactivo' 
      });
    }

    req.usuario = {
      id: usuarios[0].id_cliente,
      email: usuarios[0].email,
      rol: usuarios[0].rol
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

module.exports = { verificarToken };
