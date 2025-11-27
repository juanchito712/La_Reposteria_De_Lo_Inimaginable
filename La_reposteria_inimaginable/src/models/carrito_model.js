import connection from '../config/db.js';

class CarritoModel {
    // Obtener carrito del usuario
    static async getCarrito(cliente_id) {
        const [rows] = await connection.query(`
            SELECT 
                c.id,
                c.producto_id,
                c.cantidad,
                p.nombre,
                p.precio,
                p.descripcion,
                p.imagen,
                (c.cantidad * p.precio) as subtotal
            FROM carrito c
            INNER JOIN producto p ON c.producto_id = p.id
            WHERE c.cliente_id = ? AND c.activo = 1
            ORDER BY c.created_at DESC
        `, [cliente_id]);
        return rows;
    }

    // Obtener un item del carrito
    static async getItem(id) {
        const [rows] = await connection.query(`
            SELECT * FROM carrito WHERE id = ? AND activo = 1
        `, [id]);
        return rows[0];
    }

    // Agregar producto al carrito
    static async agregarProducto(cliente_id, producto_id, cantidad = 1) {
        // Verificar si el producto ya existe en el carrito
        const [existing] = await connection.query(`
            SELECT id, cantidad FROM carrito 
            WHERE cliente_id = ? AND producto_id = ? AND activo = 1
        `, [cliente_id, producto_id]);

        if (existing.length > 0) {
            // Actualizar cantidad
            const [result] = await connection.query(`
                UPDATE carrito SET cantidad = cantidad + ? 
                WHERE id = ?
            `, [cantidad, existing[0].id]);
            return existing[0].id;
        } else {
            // Insertar nuevo item
            const [result] = await connection.query(`
                INSERT INTO carrito (cliente_id, producto_id, cantidad, activo)
                VALUES (?, ?, ?, 1)
            `, [cliente_id, producto_id, cantidad]);
            return result.insertId;
        }
    }

    // Actualizar cantidad de producto
    static async actualizarCantidad(id, cantidad) {
        if (cantidad <= 0) {
            return this.eliminarItem(id);
        }
        
        const [result] = await connection.query(`
            UPDATE carrito SET cantidad = ? 
            WHERE id = ?
        `, [cantidad, id]);
        return result.affectedRows;
    }

    // Eliminar item del carrito
    static async eliminarItem(id) {
        const [result] = await connection.query(`
            UPDATE carrito SET activo = 0 
            WHERE id = ?
        `, [id]);
        return result.affectedRows;
    }

    // Vaciar carrito del usuario
    static async vaciarCarrito(cliente_id) {
        const [result] = await connection.query(`
            UPDATE carrito SET activo = 0 
            WHERE cliente_id = ?
        `, [cliente_id]);
        return result.affectedRows;
    }

    // Calcular total del carrito
    static async calcularTotal(cliente_id) {
        const [rows] = await connection.query(`
            SELECT SUM(c.cantidad * p.precio) as total
            FROM carrito c
            INNER JOIN producto p ON c.producto_id = p.id
            WHERE c.cliente_id = ? AND c.activo = 1
        `, [cliente_id]);
        return rows[0]?.total || 0;
    }

    // Obtener detalles del carrito con total
    static async getCarritoDetallado(cliente_id) {
        const items = await this.getCarrito(cliente_id);
        const total = await this.calcularTotal(cliente_id);
        return {
            items,
            total,
            cantidad_items: items.length
        };
    }
}

export default CarritoModel;
