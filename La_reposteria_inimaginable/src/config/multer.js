import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/img');
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp-random-originalname.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)'), false);
    }
};

// Configuración de Multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Middleware para procesar y optimizar imagen con Sharp
export const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filePath = req.file.path;
        const outputPath = filePath.replace(path.extname(filePath), '.jpg');

        // Procesar imagen: redimensionar y optimizar
        await sharp(filePath)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toFile(outputPath);

        // Si el formato original no era JPG, eliminar el archivo original
        if (path.extname(filePath) !== '.jpg') {
            await fs.unlink(filePath);
            req.file.path = outputPath;
            req.file.filename = path.basename(outputPath);
        }

        // Actualizar información del archivo
        req.file.processedPath = outputPath;
        req.file.processedFilename = path.basename(outputPath);

        next();
    } catch (error) {
        console.error('Error procesando imagen:', error);
        // Si hay error, intentar eliminar el archivo
        try {
            await fs.unlink(req.file.path);
        } catch (unlinkError) {
            console.error('Error eliminando archivo:', unlinkError);
        }
        next(error);
    }
};

// Función para eliminar imagen
export const deleteImage = async (filename) => {
    try {
        const imagePath = path.join(__dirname, '../../public/img', filename);
        await fs.unlink(imagePath);
        return { success: true, message: 'Imagen eliminada' };
    } catch (error) {
        console.error('Error eliminando imagen:', error);
        return { success: false, error: error.message };
    }
};

export default { upload, processImage, deleteImage };
