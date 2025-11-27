import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar todas las rutas
import producto_routes from './routes/producto_routes.js';
import categoria_routes from './routes/categoria_routes.js';
import pedido_routes from './routes/pedido_routes.js';
import auth_routes from './routes/auth_routes.js';
import admin_routes from './routes/admin_routes.js';
import carrito_routes from './routes/carrito_routes.js';

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors()); // Habilitar CORS para el frontend
app.use(morgan('dev')); // Logger de peticiones
app.use(express.json()); // Parser de JSON
app.use(express.urlencoded({ extended: true })); // Parser de URL-encoded

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenido a La Repoteria Inimaginable API',
        version: '1.0.0',
        endpoints: {
            productos: '/api/productos',
            categorias: '/api/categorias',
            pedidos: '/api/pedidos',
            auth: '/api/auth',
            admin: '/api/admin'
        }
    });
});

// Rutas de la API
app.use('/api/productos', producto_routes);
app.use('/api/categorias', categoria_routes);
app.use('/api/pedidos', pedido_routes);
app.use('/api/auth', auth_routes);
app.use('/api/carrito', carrito_routes);
app.use('/api/admin', admin_routes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor'
    });
});

export default app;