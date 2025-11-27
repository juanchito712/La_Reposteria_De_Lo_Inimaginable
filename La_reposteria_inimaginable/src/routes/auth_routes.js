import express from 'express';
import {
    register,
    login,
    getProfile,
    logout,
    verifyToken
} from '../controllers/auth_controller.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);                         // POST /api/auth/register
router.post('/login', login);                               // POST /api/auth/login
router.post('/logout', logout);                             // POST /api/auth/logout

// Rutas protegidas (requieren autenticación)
router.get('/profile', verifyToken, getProfile);            // GET /api/auth/profile

export default router;
