// backend/app.js (最終更新)
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const db = require('./config/database');
const envConfig = require('./config/environment');
const securityConfig = require('./config/security');
const performanceConfig = require('./config/performance');
const PerformanceMiddleware = require('./middleware/performance');
const databaseOptimizer = require('./performance/database');
const logger = require('./config/logging');

const app = express();
const config = envConfig.getConfig();

// 記錄啟動日誌
logger.info('龜馬山志工排班系統啟動中...', {
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
});

// 安全頭部設定
app.use(helmet(securityConfig.securityHeaders));

// 請求日誌
if (envConfig.isDevelopment()) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// 效能優化中間件
app.use(PerformanceMiddleware.requestTimer);
app.use(PerformanceMiddleware.requestSizeLimiter);
app.use(PerformanceMiddleware.staticFileCache);

// 中間件
app.use(compression()); // 響應壓縮
app.use(cors(config.security.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 靜態檔案服務
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 速率限制
const limiter = rateLimit({
  windowMs: config.performance.rateLimit.windowMs,
  max: config.performance.rateLimit.max,
  message: '請求過於頻繁，請稍後再試'
});
app.use('/api/', limiter);

// 監控路由
app.use('/api/monitor', require('./routes/monitoring'));

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

// 前端路由支援 (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  logger.error('伺服器錯誤', { error: err.message, stack: err.stack });
  
  if (envConfig.isProduction()) {
    res.status(500).json({ message: '伺服器錯誤' });
  } else {
    res.status(500).json({ 
      message: '伺服器錯誤',
      error: err.message,
      stack: err.stack
    });
  }
});

// 初始化效能優化
async function initializePerformance() {
  try {
    // 建立資料庫索引
    await databaseOptimizer.createOptimizedIndexes();
    logger.info('資料庫效能優化完成');
    
    // 開始效能監控
    logger.info('效能監控已啟動');
  } catch (error) {
    logger.error('效能優化初始化失敗', { error: error.message });
  }
}

// 啟動伺服器
const PORT = config.server.port;
const HOST = config.server.host;

const server = app.listen(PORT, HOST, async () => {
  logger.info(`伺服器運行在 ${HOST}:${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  
  await initializePerformance();
});

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  logger.error('未捕獲的異常', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未處理的Promise拒絕', { reason, promise });
  process.exit(1);
});

module.exports = app;
