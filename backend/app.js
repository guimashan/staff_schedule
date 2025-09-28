// backend/app.js (最終版本)
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');

const app = express();

// 檢查前端建置是否存在
const frontendBuildPath = path.join(__dirname, 'static');
const hasFrontendBuild = fs.existsSync(frontendBuildPath);

// 安全頭部設定
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  }
}));

// 請求日誌
app.use(morgan('combined'));

// 中間件
app.use(compression());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100 // 限制每個IP 15分鐘內最多100次請求
});
app.use('/api/', limiter);

// 靜態檔案服務 - 如果有前端建置則服務它們
if (hasFrontendBuild) {
  app.use(express.static(frontendBuildPath));
  console.log('✅ 前端建置已載入');
} else {
  // 如果沒有前端建置，提供一個簡單的頁面
  app.use(express.static(path.join(__dirname, '../frontend/public')));
  console.log('⚠️ 前端建置未找到，使用開發模式');
}

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    frontend: hasFrontendBuild ? 'built' : 'not built'
  });
});

// API路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API服務正常運行' });
});

// React Router支援 - 所有非API路由都返回React應用
app.get('*', (req, res) => {
  if (hasFrontendBuild) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  } else {
    // 如果沒有前端建置，返回簡單的HTML
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>龜馬山志工排班系統</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .container { max-width: 600px; margin: 0 auto; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>龜馬山志工排班系統</h1>
              <p>系統正在建置中...</p>
              <p>API服務正常運行: <a href="/api/health">健康檢查</a></p>
              <p>請確保前端已正確建置</p>
          </div>
      </body>
      </html>
    `);
  }
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '伺服器錯誤' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
  console.log(`📱 前端: http://localhost:${PORT}`);
});

module.exports = app;
