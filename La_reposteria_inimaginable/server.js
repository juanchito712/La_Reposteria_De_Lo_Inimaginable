import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar las variables de entorno desde el archivo .env ANTES de importar la app
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Verificar que JWT_SECRET está cargado
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  ADVERTENCIA: JWT_SECRET no está configurado en .env');
}

import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`El proyecto esta corriendo en http://localhost:${PORT}`);
});

