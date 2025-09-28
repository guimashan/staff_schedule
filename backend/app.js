// 更新後端以支援React Router
// backend/app.js (修正後)
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
const alertSystem = require('../production/monitoring/alerts');
const backupSystem = require('../production/backup/backup');
const securityAudit = require('../production/security/audit');

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

// 靜態檔案服務 - 指向React建置目錄
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 速率限制
const limiter = rateLimit({
  windowMs: config.performance.rateLimit.windowMs,
  max: config.performance.rateLimit.max,
  message: '請求過於頻繁，請稍後再試'
});
app.use('/api/', limiter);

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

// 監控路由
app.use('/api/monitor', require('./routes/monitoring'));

// 備份路由
app.get('/api/backup', async (req, res) => {
  try {
    const result = await backupSystem.backupFull();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 安全審計路由
app.get('/api/audit', async (req, res) => {
  try {
    const result = await securityAudit.generateSecurityReport();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

// React Router支援 - 所有非API路由都返回React應用
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

// 初始化系統功能
async function initializeSystem() {
  try {
    // 初始化效能優化
    await databaseOptimizer.createOptimizedIndexes();
    logger.info('資料庫效能優化完成');
    
    // 啟動監控系統
    alertSystem.startMonitoring();
    logger.info('系統監控已啟動');
    
    // 啟動定期備份
    backupSystem.startScheduledBackups();
    logger.info('定期備份已啟動');
    
    // 執行初始安全審計
    const auditResult = await securityAudit.performAudit();
    logger.info('初始安全審計完成', { score: auditResult.overallScore });
    
    // 發送系統啟動通知
    logger.info('系統已啟動並準備就緒');
  } catch (error) {
    logger.error('系統初始化失敗', { error: error.message });
    process.exit(1);
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
  
  await initializeSystem();
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

// 處理程序信號
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信號，正在關閉伺服器...');
  server.close(() => {
    logger.info('伺服器已關閉');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信號，正在關閉伺服器...');
  server.close(() => {
    logger.info('伺服器已關閉');
    process.exit(0);
  });
});

module.exports = app;
