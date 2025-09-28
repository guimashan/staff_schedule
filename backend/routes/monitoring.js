// backend/routes/monitoring.js
const express = require('express');
const router = express.Router();
const performanceMonitor = require('../performance/monitoring');
const os = require('os');

// 系統資訊端點
router.get('/system', (req, res) => {
  const systemInfo = {
    os: {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      usage: (1 - os.freemem() / os.totalmem()) * 100
    },
    cpu: {
      count: os.cpus().length,
      model: os.cpus()[0].model,
      speed: os.cpus()[0].speed
    },
    process: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };

  res.json(systemInfo);
});

// 效能指標端點
router.get('/metrics', (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json(metrics);
});

// 健康檢查端點
router.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    dependencies: {
      database: 'connected',
      cache: 'connected',
      redis: 'connected'
    }
  };

  res.json(health);
});

// 效能建議端點
router.get('/suggestions', (req, res) => {
  const suggestions = performanceMonitor.getPerformanceRecommendations();
  res.json({ suggestions });
});

module.exports = router;
