const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/img', express.static(path.join(__dirname, '../public/img')));

// Log de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas (temporalmente vacías, migraremos desde src)
// TODO: Importar rutas desde src
// const productosRoutes = require('./routes/productos_routes');
// const categoriasRoutes = require('./routes/categorias_routes');
// const authRoutes = require('./routes/auth_routes');

// app.use('/api/productos', productosRoutes);
// app.use('/api/categorias', categoriasRoutes);
// app.use('/api/auth', authRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🍰 API Productos funcionando correctamente',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'API Productos - La Repostería Inimaginable',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      categorias: '/api/categorias',
      auth: '/api/auth'
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
  console.log(`🍰 API PRODUCTOS corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`========================================\n`);
});

module.exports = app;
