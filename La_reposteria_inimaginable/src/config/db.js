import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'la_reposteria',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de conexión
connection.getConnection()
    .then(conn => {
        console.log('✅ Conexión a la base de datos establecida');
        conn.release();
    })
    .catch(error => {
        console.error('❌ Error al conectar a la base de datos:', error.message);
    });

export default connection;
