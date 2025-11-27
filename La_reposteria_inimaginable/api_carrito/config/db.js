const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✅ [API-CARRITO] Conexión a MySQL exitosa');
    connection.release();
  })
  .catch(err => {
    console.error('❌ [API-CARRITO] Error de conexión:', err);
  });

module.exports = pool;
