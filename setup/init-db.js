const { pool } = require('../config/db');
const { hashPassword } = require('../utils/auth');

const initDatabase = async () => {
    try {
        console.log('開始初始化資料庫...');

        // 建立組別表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS groups (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL,
                color VARCHAR(7) DEFAULT '#3498db',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ 組別表建立完成');

        // 建立班別表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS shifts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
            )
        `);
        console.log('✓ 班別表建立完成');

        // 建立用戶表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'power_user', 'user', 'testing') NOT NULL DEFAULT 'user',
                group_id INT,
                phone VARCHAR(20),
                line_id VARCHAR(50),
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ 用戶表建立完成');

        // 建立排班表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS schedules (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                date DATE NOT NULL,
                shift_id INT NOT NULL,
                group_id INT NOT NULL,
                status ENUM('confirmed', 'pending', 'requested') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ 排班表建立完成');

        // 建立請假調班申請表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                type ENUM('leave', 'change') NOT NULL,
                date DATE NOT NULL,
                shift_id INT NOT NULL,
                reason TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ 請假調班表建立完成');

        // 插入預設班別
        await pool.execute(`
            INSERT IGNORE INTO shifts (id, name, start_time, end_time) VALUES
            (1, '全天', '08:00:00', '17:00:00'),
            (2, '早班', '08:00:00', '12:00:00'),
            (3, '午班', '13:00:00', '17:00:00')
        `);
        console.log('✓ 預設班別插入完成');

        // 插入預設組別
        await pool.execute(`
            INSERT IGNORE INTO groups (id, name, color) VALUES
            (1, '神務組', '#e74c3c'),
            (2, '活動組', '#3498db'),
            (3, '誦經組', '#2ecc71'),
            (4, '辦公室', '#f39c12')
        `);
        console.log('✓ 預設組別插入完成');

        // 插入預設管理員帳號
        const adminPassword = await hashPassword('1234');
        await pool.execute(`
            INSERT IGNORE INTO users (username, password, name, role) VALUES
            ('admin', ?, '系統管理員', 'admin')
        `, [adminPassword]);
        console.log('✓ 預設管理員帳號插入完成');

        console.log('🎉 資料庫初始化完成！');

    } catch (error) {
        console.error('資料庫初始化失敗：', error);
    }
};

// 如果直接執行此檔案，則運行初始化
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;
