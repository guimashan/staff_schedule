// backend/app.js (更新後)
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const securityConfig = require('./config/security');

const app = express();

// 安全頭部設定
app.use((req, res, next) => {
  // 設定安全頭部
  Object.entries(securityConfig.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // 防止XSS攻擊
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  
  next();
});

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 限制請求大小
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 驗證中間件
app.use('/api/auth', require('./routes/auth'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // 防止敏感資訊洩漏
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: '伺服器錯誤' });
  } else {
    res.status(500).json({ 
      message: '伺服器錯誤',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`伺服器運行在 port ${PORT}`);
  console.log('安全配置已載入');
});
