const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 引入路由
const authRoutes = require('./routes/auth');

// 引入資料庫初始化
const initDatabase = require('./setup/init-db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);

// 測試路由
app.get('/', (req, res) => {
    res.json({ 
        message: '龜馬山 志工排班系統 API 伺服器運行中！',
        status: 'success',
        version: '1.0.0'
    });
});

// 健康檢查路由
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// 錯誤處理中介層
app.use((err, req, res, next) => {
    console.error('伺服器錯誤：', err);
    res.status(500).json({ error: '伺服器內部錯誤' });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({ error: '找不到此路由' });
});

// 啟動伺服器
app.listen(PORT, async () => {
    console.log(`伺服器運行在 port ${PORT}`);
    
    // 初始化資料庫
    try {
        await initDatabase();
        console.log('資料庫初始化完成');
    } catch (error) {
        console.error('資料庫初始化失敗：', error);
    }
});

module.exports = app;
