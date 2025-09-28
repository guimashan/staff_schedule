// backend/app.js (更新後)
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const securityConfig = require('./config/security');
const performanceConfig = require('./config/performance');
const PerformanceMiddleware = require('./middleware/performance');
const databaseOptimizer = require('./performance/database');

const app = express();

// 安全頭部設定
app.use((req, res, next) => {
  Object.entries(securityConfig.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  
  next();
});

// 效能優化中間件
app.use(PerformanceMiddleware.requestTimer);
app.use(PerformanceMiddleware.requestSizeLimiter);
app.use(PerformanceMiddleware.staticFileCache);

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 效能優化端點
app.get('/api/performance/monitor', PerformanceMiddleware.performanceMonitorEndpoint);
app.get('/api/performance/suggestions', PerformanceMiddleware.optimizationSuggestions);

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  
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

// 初始化效能優化
async function initializePerformance() {
  try {
    // 建立資料庫索引
    await databaseOptimizer.createOptimizedIndexes();
    console.log('資料庫效能優化完成');
    
    // 開始效能監控
    console.log('效能監控已啟動');
  } catch (error) {
    console.error('效能優化初始化失敗:', error.message);
  }
}

// 啟動伺服器
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`伺服器運行在 port ${PORT}`);
  console.log('安全配置已載入');
  console.log('效能優化已啟動');
  
  await initializePerformance();
});
