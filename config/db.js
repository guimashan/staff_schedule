const mysql = require('mysql2/promise');
require('dotenv').config();

// 資料庫連線設定
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 建立連線池
const pool = mysql.createPool(dbConfig);

// 測試連線
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('資料庫連線成功！');
        connection.release();
        return true;
    } catch (error) {
        console.error('資料庫連線失敗：', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
