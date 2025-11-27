const express = require('express');
const cors = require('cors');
require('dotenv').config();

const carritoRoutes = require('./routes/carrito_routes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/carrito', carritoRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🛒 API Carrito funcionando correctamente',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'API Carrito - La Repostería Inimaginable',
    version: '1.0.0',
    endpoints: {
      carrito: '/api/carrito',
      agregar: '/api/carrito/agregar',
      checkout: '/api/carrito/checkout'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🛒 API CARRITO corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`========================================\n`);
});

module.exports = app;
