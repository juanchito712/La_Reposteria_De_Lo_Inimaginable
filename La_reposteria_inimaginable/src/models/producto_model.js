import connection from '../config/db.js';

class ProductoModel {
    // Obtener todos los productos
    static async getAll() {
        const [rows] = await connection.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                p.destacado,
                p.activo,
                c.id as categoria_id,
                c.nombre as categoria_nombre
            FROM producto p
            INNER JOIN categoria c ON p.categoria_id = c.id
            WHERE p.activo = 1
            ORDER BY p.nombre ASC
        `);
        return rows;
    }

    // Obtener producto por ID
    static async getById(id) {
        const [rows] = await connection.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                p.destacado,
                p.activo,
                c.id as categoria_id,
                c.nombre as categoria_nombre
            FROM producto p
            INNER JOIN categoria c ON p.categoria_id = c.id
            WHERE p.id = ? AND p.activo = 1
        `, [id]);
        return rows[0];
    }

    // Crear producto
    static async create(producto) {
        const { nombre, descripcion, precio, stock, imagen, categoria_id, destacado = 0 } = producto;
        const [result] = await connection.query(`
            INSERT INTO producto (nombre, descripcion, precio, stock, imagen, categoria_id, destacado, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [nombre, descripcion, precio, stock, imagen, categoria_id, destacado]);
        return result.insertId;
    }

    // Actualizar producto
    static async update(id, producto) {
        const { nombre, descripcion, precio, stock, imagen, categoria_id, destacado } = producto;
        const [result] = await connection.query(`
            UPDATE producto 
            SET nombre = ?, descripcion = ?, precio = ?, stock = ?, 
                imagen = ?, categoria_id = ?, destacado = ?
            WHERE id = ?
        `, [nombre, descripcion, precio, stock, imagen, categoria_id, destacado, id]);
        return result.affectedRows;
    }

    // Eliminar producto (soft delete)
    static async delete(id) {
        const [result] = await connection.query(`
            UPDATE producto SET activo = 0 WHERE id = ?
        `, [id]);
        return result.affectedRows;
    }

    // Obtener productos por categoría
    static async getByCategoria(categoria_id) {
        const [rows] = await connection.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                p.destacado,
                p.activo,
                c.id as categoria_id,
                c.nombre as categoria_nombre
            FROM producto p
            INNER JOIN categoria c ON p.categoria_id = c.id
            WHERE p.categoria_id = ? AND p.activo = 1
            ORDER BY p.nombre ASC
        `, [categoria_id]);
        return rows;
    }

    // Obtener productos destacados
    static async getDestacados() {
        const [rows] = await connection.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                c.nombre as categoria_nombre
            FROM producto p
            INNER JOIN categoria c ON p.categoria_id = c.id
            WHERE p.destacado = 1 AND p.activo = 1 AND p.stock > 0
            ORDER BY p.precio DESC
        `);
        return rows;
    }

    // Buscar productos
    static async search(termino) {
        const [rows] = await connection.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                c.nombre as categoria_nombre
            FROM producto p
            INNER JOIN categoria c ON p.categoria_id = c.id
            WHERE (p.nombre LIKE ? OR p.descripcion LIKE ?) 
                AND p.activo = 1
            ORDER BY p.nombre ASC
        `, [`%${termino}%`, `%${termino}%`]);
        return rows;
    }
}

export default ProductoModel;
