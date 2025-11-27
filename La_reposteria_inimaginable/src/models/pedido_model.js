import connection from '../config/db.js';

class PedidoModel {
    // Obtener todos los pedidos (admin)
    static async getAll() {
        const [rows] = await connection.query(`
            SELECT 
                p.id,
                p.cliente_id,
                c.nombre as cliente_nombre,
                c.email as cliente_email,
                p.total,
                p.estado,
                p.fecha_pedido,
                p.fecha_entrega,
                p.direccion_entrega,
                p.telefono_entrega
            FROM pedido p
            INNER JOIN cliente c ON p.cliente_id = c.id
            ORDER BY p.fecha_pedido DESC
        `);
        return rows;
    }

    // Obtener pedido por ID con detalles
    static async getById(id) {
        const [pedido] = await connection.query(`
            SELECT 
                p.id,
                p.cliente_id,
                c.nombre as cliente_nombre,
                c.email as cliente_email,
                p.total,
                p.estado,
                p.fecha_pedido,
                p.fecha_entrega,
                p.direccion_entrega,
                p.telefono_entrega,
                p.notas
            FROM pedido p
            INNER JOIN cliente c ON p.cliente_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (pedido.length === 0) return null;

        // Obtener detalles del pedido
        const [detalles] = await connection.query(`
            SELECT 
                pd.id,
                pd.producto_id,
                pr.nombre as producto_nombre,
                pr.imagen as producto_imagen,
                pd.cantidad,
                pd.precio_unitario,
                pd.subtotal
            FROM pedido_detalle pd
            INNER JOIN producto pr ON pd.producto_id = pr.id
            WHERE pd.pedido_id = ?
        `, [id]);

        return {
            ...pedido[0],
            detalles: detalles
        };
    }

    // Obtener pedidos por cliente
    static async getByCliente(cliente_id) {
        const [rows] = await connection.query(`
            SELECT 
                id,
                total,
                estado,
                fecha_pedido,
                fecha_entrega,
                direccion_entrega
            FROM pedido
            WHERE cliente_id = ?
            ORDER BY fecha_pedido DESC
        `, [cliente_id]);
        return rows;
    }

    // Crear pedido
    static async create(pedido) {
        const { 
            cliente_id, 
            total, 
            direccion_entrega, 
            telefono_entrega, 
            notas,
            detalles 
        } = pedido;

        const connection_db = await connection.getConnection();
        
        try {
            await connection_db.beginTransaction();

            // Insertar pedido
            const [result] = await connection_db.query(`
                INSERT INTO pedido (
                    cliente_id, total, estado, direccion_entrega, 
                    telefono_entrega, notas, fecha_pedido
                )
                VALUES (?, ?, 'pendiente', ?, ?, ?, NOW())
            `, [cliente_id, total, direccion_entrega, telefono_entrega, notas]);

            const pedido_id = result.insertId;

            // Insertar detalles del pedido
            for (const detalle of detalles) {
                await connection_db.query(`
                    INSERT INTO pedido_detalle (
                        pedido_id, producto_id, cantidad, precio_unitario, subtotal
                    )
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    pedido_id, 
                    detalle.producto_id, 
                    detalle.cantidad, 
                    detalle.precio_unitario, 
                    detalle.subtotal
                ]);

                // Actualizar stock del producto
                await connection_db.query(`
                    UPDATE producto 
                    SET stock = stock - ? 
                    WHERE id = ?
                `, [detalle.cantidad, detalle.producto_id]);
            }

            await connection_db.commit();
            connection_db.release();
            
            return pedido_id;
        } catch (error) {
            await connection_db.rollback();
            connection_db.release();
            throw error;
        }
    }

    // Actualizar estado del pedido
    static async updateEstado(id, estado, fecha_entrega = null) {
        const [result] = await connection.query(`
            UPDATE pedido 
            SET estado = ?, fecha_entrega = ?
            WHERE id = ?
        `, [estado, fecha_entrega, id]);
        return result.affectedRows;
    }

    // Cancelar pedido
    static async cancel(id) {
        const connection_db = await connection.getConnection();
        
        try {
            await connection_db.beginTransaction();

            // Obtener detalles del pedido
            const [detalles] = await connection_db.query(`
                SELECT producto_id, cantidad 
                FROM pedido_detalle 
                WHERE pedido_id = ?
            `, [id]);

            // Restaurar stock
            for (const detalle of detalles) {
                await connection_db.query(`
                    UPDATE producto 
                    SET stock = stock + ? 
                    WHERE id = ?
                `, [detalle.cantidad, detalle.producto_id]);
            }

            // Actualizar estado
            await connection_db.query(`
                UPDATE pedido 
                SET estado = 'cancelado' 
                WHERE id = ?
            `, [id]);

            await connection_db.commit();
            connection_db.release();
            
            return true;
        } catch (error) {
            await connection_db.rollback();
            connection_db.release();
            throw error;
        }
    }

    // Estadísticas de pedidos
    static async getEstadisticas() {
        const [rows] = await connection.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
                SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregados,
                SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
                SUM(total) as total_ventas
            FROM pedido
        `);
        return rows[0];
    }

    // Agregar detalle al pedido (usado por carrito)
    static async agregarDetalle(pedido_id, detalle) {
        const { producto_id, cantidad, precio_unitario } = detalle;
        const subtotal = cantidad * precio_unitario;

        const [result] = await connection.query(`
            INSERT INTO pedido_detalle (
                pedido_id, producto_id, cantidad, precio_unitario, subtotal
            )
            VALUES (?, ?, ?, ?, ?)
        `, [pedido_id, producto_id, cantidad, precio_unitario, subtotal]);

        // Actualizar stock
        await connection.query(`
            UPDATE producto 
            SET stock = stock - ? 
            WHERE id = ?
        `, [cantidad, producto_id]);

        return result.insertId;
    }
}

export default PedidoModel;
