const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors());
app.use(express.json());

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

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器運行在 port ${PORT}`);
});

module.exports = app;
