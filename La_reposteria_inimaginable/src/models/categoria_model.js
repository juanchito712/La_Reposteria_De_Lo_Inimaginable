import connection from '../config/db.js';

class CategoriaModel {
    // Obtener todas las categorías
    static async getAll() {
        const [rows] = await connection.query(`
            SELECT id, nombre, descripcion 
            FROM categoria 
            ORDER BY nombre ASC
        `);
        return rows;
    }

    // Obtener categoría por ID
    static async getById(id) {
        const [rows] = await connection.query(`
            SELECT id, nombre, descripcion 
            FROM categoria 
            WHERE id = ?
        `, [id]);
        return rows[0];
    }

    // Crear categoría
    static async create(categoria) {
        const { nombre, descripcion } = categoria;
        const [result] = await connection.query(`
            INSERT INTO categoria (nombre, descripcion) 
            VALUES (?, ?)
        `, [nombre, descripcion]);
        return result.insertId;
    }

    // Actualizar categoría
    static async update(id, categoria) {
        const { nombre, descripcion } = categoria;
        const [result] = await connection.query(`
            UPDATE categoria 
            SET nombre = ?, descripcion = ? 
            WHERE id = ?
        `, [nombre, descripcion, id]);
        return result.affectedRows;
    }

    // Eliminar categoría
    static async delete(id) {
        const [result] = await connection.query(`
            DELETE FROM categoria WHERE id = ?
        `, [id]);
        return result.affectedRows;
    }

    // Obtener categoría con sus productos
    static async getWithProducts(id) {
        const [rows] = await connection.query(`
            SELECT 
                c.id,
                c.nombre,
                c.descripcion,
                p.id as producto_id,
                p.nombre as producto_nombre,
                p.precio,
                p.imagen
            FROM categoria c
            LEFT JOIN producto p ON c.id = p.categoria_id AND p.activo = 1
            WHERE c.id = ?
            ORDER BY p.nombre ASC
        `, [id]);
        
        if (rows.length === 0) return null;
        
        // Formatear respuesta
        const categoria = {
            id: rows[0].id,
            nombre: rows[0].nombre,
            descripcion: rows[0].descripcion,
            productos: rows.filter(r => r.producto_id).map(r => ({
                id: r.producto_id,
                nombre: r.producto_nombre,
                precio: r.precio,
                imagen: r.imagen
            }))
        };
        
        return categoria;
    }
}

export default CategoriaModel;
