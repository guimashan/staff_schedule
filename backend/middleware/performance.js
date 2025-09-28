// backend/middleware/performance.js
const performanceMonitor = require('../performance/monitoring');
const cacheManager = require('../performance/cache');

class PerformanceMiddleware {
  // 請求計時器
  static requestTimer(req, res, next) {
    const startTime = Date.now();
    
    // 記錄請求開始
    performanceMonitor.recordRequest(0, null, req.path);
    
    // 監聽響應結束事件
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      performanceMonitor.completeRequest();
      performanceMonitor.recordRequest(duration, res.statusCode, req.path);
    });
    
    next();
  }

  // 響應壓縮
  static responseCompression(req, res, next) {
    const originalSend = res.send;
    
    res.send = function(data) {
      // 檢查是否需要壓縮
      if (typeof data === 'string' && data.length > 1024) {
        // 在實際應用中，這裡會使用壓縮算法
        // 例如: gzip, brotli
        res.setHeader('Content-Encoding', 'gzip');
      }
      return originalSend.call(this, data);
    };
    
    next();
  }

  // 快取中間件
  static cacheMiddleware(ttl = 300) {
    return (req, res, next) => {
      const cacheKey = `response_${req.method}_${req.originalUrl}`;
      const cachedResponse = cacheManager.get(cacheKey);
      
      if (cachedResponse && req.method === 'GET') {
        performanceMonitor.recordCacheOperation('get', true);
        res.setHeader('X-Cache', 'HIT');
        res.json(cachedResponse);
        return;
      }
      
      performanceMonitor.recordCacheOperation('get', false);
      
      // 覆蓋res.json以實現自動快取
      const originalJson = res.json;
      res.json = function(data) {
        if (req.method === 'GET' && res.statusCode === 200) {
          cacheManager.set(cacheKey, data, ttl);
          res.setHeader('X-Cache', 'MISS');
        }
        return originalJson.call(this, data);
      };
      
      next();
    };
  }

  // 資料庫查詢優化
  static dbQueryOptimizer(req, res, next) {
    const originalQuery = req.dbQuery || db.all;
    
    req.dbQuery = async function(query, params = []) {
      const startTime = Date.now();
      try {
        const result = await originalQuery(query, params);
        const duration = Date.now() - startTime;
        
        performanceMonitor.recordDatabaseQuery(duration, 'SELECT');
        return result;
      } catch (error) {
        throw error;
      }
    };
    
    next();
  }

  // 靜態檔案快取
  static staticFileCache(req, res, next) {
    // 設定靜態檔案快取頭部
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年
      res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    
    next();
  }

  // API響應優化
  static apiResponseOptimizer(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
      // 優化響應資料
      const optimizedData = PerformanceMiddleware.optimizeResponseData(data);
      
      // 設定響應頭部
      res.setHeader('X-Response-Time', Date.now() - req.startTime);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return originalJson.call(this, optimizedData);
    };
    
    req.startTime = Date.now();
    next();
  }

  // 響應資料優化
  static optimizeResponseData(data) {
    if (!data) return data;
    
    // 移除不必要的屬性
    const optimized = JSON.parse(JSON.stringify(data));
    
    // 限制響應大小
    if (Array.isArray(optimized) && optimized.length > 1000) {
      return optimized.slice(0, 1000);
    }
    
    return optimized;
  }

  // 請求大小限制
  static requestSizeLimiter(req, res, next) {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      return res.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: '請求體積過大'
      });
    }
    
    next();
  }

  // 效能監控端點
  static performanceMonitorEndpoint(req, res) {
    const report = performanceMonitor.getPerformanceReport();
    res.json(report);
  }

  // 效能優化建議端點
  static optimizationSuggestions(req, res) {
    const suggestions = performanceMonitor.getPerformanceRecommendations();
    res.json({
      suggestions,
      metrics: performanceMonitor.getMetrics()
    });
  }
}

module.exports = PerformanceMiddleware;
