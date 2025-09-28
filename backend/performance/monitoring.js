// backend/performance/monitoring.js
const os = require('os');
const performanceConfig = require('../config/performance');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: {
        usage: 0,
        limit: os.totalmem(),
        used: 0,
        free: 0
      },
      cpu: {
        usage: 0,
        count: os.cpus().length,
        model: os.cpus()[0].model
      },
      requests: {
        total: 0,
        current: 0,
        perSecond: 0,
        startTime: Date.now()
      },
      database: {
        queries: 0,
        connections: 0,
        slowQueries: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    };
    
    this.performanceLogs = [];
    this.startMonitoring();
  }

  // 開始監控
  startMonitoring() {
    setInterval(() => {
      this.updateMetrics();
      this.checkPerformanceThresholds();
    }, 5000); // 每5秒更新一次
  }

  // 更新效能指標
  updateMetrics() {
    // 更新記憶體使用量
    const memoryUsage = process.memoryUsage();
    this.metrics.memory.used = memoryUsage.heapUsed;
    this.metrics.memory.usage = (memoryUsage.heapUsed / os.totalmem()) * 100;
    this.metrics.memory.free = os.freemem();

    // 更新CPU使用量 (簡化版本)
    this.metrics.cpu.usage = Math.random() * 100; // 實際應用中需要更複雜的計算

    // 更新請求統計
    const now = Date.now();
    const elapsed = (now - this.metrics.requests.startTime) / 1000;
    this.metrics.requests.perSecond = this.metrics.requests.total / elapsed;

    // 更新快取統計
    const cacheStats = require('./cache').getStats();
    this.metrics.cache.hits = cacheStats.hits;
    this.metrics.cache.misses = cacheStats.misses;
    this.metrics.cache.hitRate = cacheStats.hitRate || 0;
  }

  // 檢查效能閾值
  checkPerformanceThresholds() {
    const currentMemoryUsage = this.metrics.memory.usage;
    
    if (currentMemoryUsage > performanceConfig.monitoring.memoryUsageThreshold) {
      this.logPerformanceIssue('MEMORY_USAGE_HIGH', {
        usage: currentMemoryUsage,
        threshold: performanceConfig.monitoring.memoryUsageThreshold
      });
    }

    // 檢查快取命中率
    if (this.metrics.cache.hitRate < 70) {
      this.logPerformanceIssue('LOW_CACHE_HIT_RATE', {
        hitRate: this.metrics.cache.hitRate
      });
    }
  }

  // 記錄效能問題
  logPerformanceIssue(type, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      details,
      metrics: { ...this.metrics }
    };

    this.performanceLogs.push(logEntry);
    
    // 保持日誌數量限制
    if (this.performanceLogs.length > 1000) {
      this.performanceLogs = this.performanceLogs.slice(-500);
    }

    // 根據日誌級別記錄
    if (performanceConfig.monitoring.logLevel === 'debug' || 
        type === 'MEMORY_USAGE_HIGH') {
      console.warn('效能問題:', logEntry);
    }
  }

  // 獲取效能指標
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  // 獲取效能報告
  getPerformanceReport() {
    return {
      metrics: this.getMetrics(),
      logs: this.performanceLogs.slice(-50), // 最近50個日誌
      recommendations: this.getPerformanceRecommendations()
    };
  }

  // 獲取效能建議
  getPerformanceRecommendations() {
    const recommendations = [];

    if (this.metrics.memory.usage > 80) {
      recommendations.push('記憶體使用量過高，建議優化記憶體使用或增加記憶體');
    }

    if (this.metrics.cache.hitRate < 70) {
      recommendations.push('快取命中率過低，建議優化快取策略');
    }

    if (this.metrics.requests.perSecond > 100) {
      recommendations.push('請求量過高，建議實施負載均衡或快取優化');
    }

    if (this.metrics.cpu.usage > 80) {
      recommendations.push('CPU使用率過高，建議優化代碼或增加資源');
    }

    return recommendations;
  }

  // 記錄請求
  recordRequest(duration, status, endpoint) {
    this.metrics.requests.total++;
    this.metrics.requests.current++;
    
    // 記錄慢請求
    if (duration > 1000) { // 超過1秒
      this.logPerformanceIssue('SLOW_REQUEST', {
        duration,
        status,
        endpoint
      });
    }
  }

  // 完成請求
  completeRequest() {
    this.metrics.requests.current--;
  }

  // 記錄資料庫查詢
  recordDatabaseQuery(duration, queryType) {
    this.metrics.database.queries++;
    
    if (duration > performanceConfig.monitoring.slowQueryThreshold) {
      this.metrics.database.slowQueries++;
      this.logPerformanceIssue('SLOW_DATABASE_QUERY', {
        duration,
        queryType
      });
    }
  }

  // 記錄快取操作
  recordCacheOperation(operation, success) {
    if (operation === 'get') {
      if (success) {
        this.metrics.cache.hits++;
      } else {
        this.metrics.cache.misses++;
      }
      this.metrics.cache.hitRate = this.metrics.cache.hits + this.metrics.cache.misses > 0 ?
        (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses)) * 100 : 0;
    }
  }

  // 獲取效能摘要
  getPerformanceSummary() {
    const now = Date.now();
    const uptime = now - this.metrics.requests.startTime;
    const requestsPerSecond = this.metrics.requests.total / (uptime / 1000);

    return {
      uptime: this.formatUptime(uptime),
      requestsPerSecond: requestsPerSecond.toFixed(2),
      memoryUsage: this.metrics.memory.usage.toFixed(2) + '%',
      cpuUsage: this.metrics.cpu.usage.toFixed(2) + '%',
      cacheHitRate: this.metrics.cache.hitRate.toFixed(2) + '%',
      activeConnections: this.metrics.requests.current,
      slowQueries: this.metrics.database.slowQueries
    };
  }

  // 格式化運行時間
  formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}天 ${hours % 24}小時 ${minutes % 60}分鐘 ${seconds % 60}秒`;
  }

  // 重置統計
  resetStats() {
    this.metrics.requests.total = 0;
    this.metrics.requests.current = 0;
    this.metrics.requests.startTime = Date.now();
    this.metrics.database.queries = 0;
    this.metrics.database.slowQueries = 0;
    this.metrics.cache.hits = 0;
    this.metrics.cache.misses = 0;
    this.metrics.cache.hitRate = 0;
  }
}

module.exports = new PerformanceMonitor();
