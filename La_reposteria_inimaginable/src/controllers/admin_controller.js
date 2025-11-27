import ProductoModel from '../models/producto_model.js';
import PedidoModel from '../models/pedido_model.js';
import ClienteModel from '../models/cliente_model.js';
import CategoriaModel from '../models/categoria_model.js';
import connection from '../config/db.js';

// ===== DASHBOARD Y ESTADÍSTICAS =====

export const getDashboardStats = async (req, res) => {
    try {
        // Estadísticas generales
        const [stats] = await connection.query(`
            SELECT 
                (SELECT COUNT(*) FROM producto WHERE activo = 1) as total_productos,
                (SELECT COUNT(*) FROM pedido) as total_pedidos,
                (SELECT COUNT(*) FROM cliente) as total_clientes,
                (SELECT SUM(total) FROM pedido WHERE estado != 'cancelado') as ventas_totales,
                (SELECT COUNT(*) FROM pedido WHERE estado = 'pendiente') as pedidos_pendientes,
                (SELECT COUNT(*) FROM pedido WHERE DATE(fecha_pedido) = CURDATE()) as pedidos_hoy
        `);

        // Productos con bajo stock
        const [bajoStock] = await connection.query(`
            SELECT id, nombre, stock, categoria_id
            FROM producto 
            WHERE stock < 5 AND activo = 1
            ORDER BY stock ASC
            LIMIT 10
        `);

        // Últimos pedidos
        const [ultimosPedidos] = await connection.query(`
            SELECT 
                p.id,
                p.fecha_pedido,
                p.total,
                p.estado,
                CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre
            FROM pedido p
            INNER JOIN cliente c ON p.cliente_id = c.id
            ORDER BY p.fecha_pedido DESC
            LIMIT 10
        `);

        // Productos más vendidos
        const [masVendidos] = await connection.query(`
            SELECT 
                pr.id,
                pr.nombre,
                SUM(pd.cantidad) as total_vendido,
                SUM(pd.subtotal) as ingresos
            FROM pedido_detalle pd
            INNER JOIN producto pr ON pd.producto_id = pr.id
            INNER JOIN pedido p ON pd.pedido_id = p.id
            WHERE p.estado != 'cancelado'
            GROUP BY pr.id, pr.nombre
            ORDER BY total_vendido DESC
            LIMIT 10
        `);

        // Ventas por mes (últimos 6 meses)
        const [ventasPorMes] = await connection.query(`
            SELECT 
                DATE_FORMAT(fecha_pedido, '%Y-%m') as mes,
                COUNT(*) as total_pedidos,
                SUM(total) as total_ventas
            FROM pedido
            WHERE fecha_pedido >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                AND estado != 'cancelado'
            GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m')
            ORDER BY mes DESC
        `);

        res.json({
            success: true,
            data: {
                estadisticas: stats[0],
                bajoStock,
                ultimosPedidos,
                masVendidos,
                ventasPorMes
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas del dashboard'
        });
    }
};

// ===== GESTIÓN DE USUARIOS =====

export const getUsuarios = async (req, res) => {
    try {
        const usuarios = await ClienteModel.getAll();
        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener usuarios'
        });
    }
};

export const updateUsuarioRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        if (!['admin', 'cliente'].includes(rol)) {
            return res.status(400).json({
                success: false,
                error: 'Rol inválido. Debe ser "admin" o "cliente"'
            });
        }

        // No permitir cambiar el rol del usuario actual
        if (parseInt(id) === req.usuario.id) {
            return res.status(400).json({
                success: false,
                error: 'No puedes cambiar tu propio rol'
            });
        }

        const [result] = await connection.query(
            'UPDATE cliente SET rol = ? WHERE id = ?',
            [rol, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Rol actualizado correctamente'
        });
    } catch (error) {
        console.error('Error actualizando rol:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el rol del usuario'
        });
    }
};

export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir eliminar el usuario actual
        if (parseInt(id) === req.usuario.id) {
            return res.status(400).json({
                success: false,
                error: 'No puedes eliminar tu propia cuenta'
            });
        }

        // Primero, eliminar todos los pedidos asociados (y sus detalles por cascada)
        await connection.query(
            'DELETE FROM pedido WHERE cliente_id = ?',
            [id]
        );

        // Luego, eliminar el usuario
        const affected = await ClienteModel.delete(id);

        if (affected === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario eliminado completamente de la base de datos'
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar usuario'
        });
    }
};

// ===== GESTIÓN DE PEDIDOS =====

export const updateEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
        
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido'
            });
        }

        const [result] = await connection.query(
            'UPDATE pedido SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pedido no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estado del pedido actualizado correctamente'
        });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar estado del pedido'
        });
    }
};

export const getTodosPedidos = async (req, res) => {
    try {
        // Obtener pedidos
        const [pedidos] = await connection.query(`
            SELECT 
                p.id,
                p.fecha_pedido,
                p.total,
                p.estado,
                p.direccion_entrega,
                p.telefono_entrega,
                p.notas,
                CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre,
                c.email as cliente_email,
                c.telefono as cliente_telefono
            FROM pedido p
            INNER JOIN cliente c ON p.cliente_id = c.id
            ORDER BY p.fecha_pedido DESC
        `);

        // Obtener detalles de cada pedido
        for (let pedido of pedidos) {
            const [detalles] = await connection.query(`
                SELECT 
                    pd.producto_id,
                    pr.nombre as producto_nombre,
                    pd.cantidad,
                    pd.precio_unitario,
                    pd.subtotal
                FROM pedido_detalle pd
                INNER JOIN producto pr ON pd.producto_id = pr.id
                WHERE pd.pedido_id = ?
            `, [pedido.id]);
            
            pedido.detalles = detalles;
        }

        res.json({
            success: true,
            data: pedidos
        });
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedidos'
        });
    }
};

// ===== REPORTES =====

export const getReporteVentas = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let query = `
            SELECT 
                DATE(p.fecha_pedido) as fecha,
                COUNT(DISTINCT p.id) as total_pedidos,
                SUM(p.total) as total_ventas,
                AVG(p.total) as venta_promedio,
                COUNT(DISTINCT p.cliente_id) as clientes_unicos
            FROM pedido p
            WHERE p.estado != 'cancelado'
        `;

        const params = [];

        if (fecha_inicio && fecha_fin) {
            query += ` AND DATE(p.fecha_pedido) BETWEEN ? AND ?`;
            params.push(fecha_inicio, fecha_fin);
        } else {
            query += ` AND DATE(p.fecha_pedido) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        }

        query += ` GROUP BY DATE(p.fecha_pedido) ORDER BY fecha DESC`;

        const [reporte] = await connection.query(query, params);

        res.json({
            success: true,
            data: reporte
        });
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte de ventas'
        });
    }
};
