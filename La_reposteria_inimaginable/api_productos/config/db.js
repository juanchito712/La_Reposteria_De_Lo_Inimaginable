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
    console.log('✅ [API-PRODUCTOS] Conexión a MySQL exitosa');
    connection.release();
  })
  .catch(err => {
    console.error('❌ [API-PRODUCTOS] Error de conexión:', err);
  });

module.exports = pool;
