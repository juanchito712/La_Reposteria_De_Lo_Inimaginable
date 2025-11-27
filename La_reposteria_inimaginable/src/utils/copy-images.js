import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = 'c:\\Users\\SENA\\Documents\\GitHub\\LA-REPOSTERIA-INIMAGINABLE\\proyecto\\public\\img';
const targetDir = path.join(__dirname, '../../public/img');

async function copyImages() {
    try {
        console.log('🖼️  Iniciando copia de imágenes...');
        console.log(`📂 Origen: ${sourceDir}`);
        console.log(`📁 Destino: ${targetDir}`);
        
        // Crear directorio de destino si no existe
        await fs.mkdir(targetDir, { recursive: true });
        
        // Leer archivos del directorio fuente
        const files = await fs.readdir(sourceDir);
        
        console.log(`\n📋 Se encontraron ${files.length} archivos`);
        
        let copiedCount = 0;
        let skippedCount = 0;
        
        for (const file of files) {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);
            
            // Verificar si es un archivo (no directorio)
            const stats = await fs.stat(sourcePath);
            if (stats.isFile()) {
                try {
                    await fs.copyFile(sourcePath, targetPath);
                    console.log(`✅ Copiado: ${file}`);
                    copiedCount++;
                } catch (error) {
                    console.error(`❌ Error copiando ${file}:`, error.message);
                    skippedCount++;
                }
            }
        }
        
        console.log(`\n✨ Proceso completado:`);
        console.log(`   ✅ Copiadas: ${copiedCount}`);
        console.log(`   ⚠️  Omitidas: ${skippedCount}`);
        console.log(`   📊 Total: ${copiedCount + skippedCount}`);
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
        process.exit(1);
    }
}

// Ejecutar
copyImages();
