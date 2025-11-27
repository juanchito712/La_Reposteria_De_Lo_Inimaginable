import ClienteModel from '../models/cliente_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Registrar nuevo usuario
export const register = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion } = req.body;
        
        // Validar datos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, email y contraseña son requeridos'
            });
        }
        
        // Validar formato de email (mínimo 2 letras después del punto)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido. Debe tener al menos 2 letras después del punto'
            });
        }
        
        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Validar teléfono (solo números si se proporciona)
        if (telefono && !/^\d+$/.test(telefono.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                error: 'El teléfono solo debe contener números'
            });
        }
        
        // Validar máximo 10 dígitos en teléfono
        if (telefono && telefono.replace(/\D/g, '').length > 10) {
            return res.status(400).json({
                success: false,
                error: 'El teléfono debe tener máximo 10 dígitos'
            });
        }
        
        // Verificar si el email ya existe
        const existingUser = await ClienteModel.getByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Crear usuario
        const userId = await ClienteModel.create({
            nombre,
            email,
            password: hashedPassword,
            telefono: telefono || null,
            direccion: direccion || null
        });
        
        // Generar token JWT
        const token = jwt.sign(
            { id: userId, email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.status(201).json({
            success: true,
            data: {
                message: 'Usuario registrado exitosamente',
                token,
                user: {
                    id: userId,
                    nombre,
                    email,
                    rol: 'cliente' // Por defecto los nuevos usuarios son clientes
                }
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar el usuario'
        });
    }
};

// Iniciar sesión
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validar datos requeridos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }
        
        // Buscar usuario por email
        const user = await ClienteModel.getByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.json({
            success: true,
            data: {
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id,
                    nombre: `${user.nombre} ${user.apellido}`.trim(),
                    email: user.email,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    rol: user.rol
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión'
        });
    }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        // El ID viene del middleware de autenticación
        const userId = req.userId;
        
        const user = await ClienteModel.getById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // No enviar la contraseña
        delete user.password;
        
        // Combinar nombre y apellido
        if (user.nombre && user.apellido) {
            user.nombre_completo = `${user.nombre} ${user.apellido}`.trim();
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el perfil'
        });
    }
};

// Cerrar sesión (en realidad solo se invalida el token del lado del cliente)
export const logout = async (req, res) => {
    res.json({
        success: true,
        data: { message: 'Sesión cerrada exitosamente' }
    });
};

// Middleware para verificar token JWT
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }
        
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};
