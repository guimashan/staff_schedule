// backend/config/performance.js
const performanceConfig = {
  // 快取配置
  cache: {
    enabled: true,
    ttl: 300, // 5分鐘
    max: 1000, // 最大快取項目數
    compression: true,
    prefix: 'guimashan_'
  },
  
  // 資料庫效能配置
  database: {
    connectionPool: {
      min: 2,
      max: 10,
      acquire: 30000,
      idle: 10000
    },
    queryTimeout: 5000,
    enableQueryLogging: false
  },
  
  // API效能配置
  api: {
    responseTimeout: 10000,
    maxConcurrentRequests: 100,
    enableResponseCompression: true,
    responseCompressionLevel: 6
  },
  
  // 檔案上傳效能
  fileUpload: {
    maxFileSize: '10MB',
    uploadTimeout: 30000,
    enableStreaming: true,
    tempDir: './temp'
  },
  
  // 監控配置
  monitoring: {
    enabled: true,
    logLevel: 'info',
    performanceMetrics: true,
    slowQueryThreshold: 100, // 毫秒
    memoryUsageThreshold: 80 // 百分比
  },
  
  // 負載均衡配置
  loadBalancing: {
    maxConnections: 1000,
    queueSize: 100,
    timeout: 30000
  }
};

module.exports = performanceConfig;
