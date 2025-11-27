import connection from '../config/db.js';

class ClienteModel {
    // Obtener todos los clientes
    static async getAll() {
        const [rows] = await connection.query(`
            SELECT id, nombre, apellido, nombre_usuario, email, telefono, direccion, rol, activo, fecha_registro
            FROM cliente
            WHERE activo = 1
            ORDER BY fecha_registro DESC
        `);
        return rows;
    }

    // Obtener cliente por ID
    static async getById(id) {
        const [rows] = await connection.query(`
            SELECT id, nombre, apellido, nombre_usuario, email, telefono, direccion, rol, activo, fecha_registro
            FROM cliente
            WHERE id = ? AND activo = 1
        `, [id]);
        return rows[0];
    }

    // Obtener cliente por email
    static async getByEmail(email) {
        const [rows] = await connection.query(`
            SELECT id, nombre, apellido, nombre_usuario, email, password, telefono, direccion, rol, activo, fecha_registro
            FROM cliente
            WHERE email = ?
        `, [email]);
        return rows[0];
    }

    // Crear cliente (registro)
    static async create(cliente) {
        const { nombre, email, password, telefono, direccion, rol = 'cliente' } = cliente;
        
        // Dividir nombre completo en nombre y apellido
        const nombreParts = nombre.trim().split(' ');
        const primerNombre = nombreParts[0] || '';
        const apellido = nombreParts.slice(1).join(' ') || primerNombre;
        
        const [result] = await connection.query(`
            INSERT INTO cliente (nombre, apellido, email, password, telefono, direccion, rol, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [primerNombre, apellido, email, password, telefono, direccion, rol]);
        return result.insertId;
    }

    // Actualizar cliente
    static async update(id, cliente) {
        const { nombre, email, telefono, direccion } = cliente;
        const [result] = await connection.query(`
            UPDATE cliente 
            SET nombre = ?, email = ?, telefono = ?, direccion = ?
            WHERE id = ?
        `, [nombre, email, telefono, direccion, id]);
        return result.affectedRows;
    }

    // Actualizar contraseña
    static async updatePassword(id, newPassword) {
        const [result] = await connection.query(`
            UPDATE cliente 
            SET password = ? 
            WHERE id = ?
        `, [newPassword, id]);
        return result.affectedRows;
    }

    // Eliminar cliente (hard delete)
    static async delete(id) {
        const [result] = await connection.query(`
            DELETE FROM cliente WHERE id = ?
        `, [id]);
        return result.affectedRows;
    }

    // Verificar si email existe
    static async emailExists(email) {
        const [rows] = await connection.query(`
            SELECT id FROM cliente WHERE email = ?
        `, [email]);
        return rows.length > 0;
    }
}

export default ClienteModel;
