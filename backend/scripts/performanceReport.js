// backend/scripts/performanceReport.js
const fs = require('fs');
const path = require('path');
const performanceMonitor = require('../performance/monitoring');

class PerformanceReportGenerator {
  static async generate() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        summary: performanceMonitor.getPerformanceSummary(),
        metrics: performanceMonitor.getMetrics(),
        recommendations: performanceMonitor.getPerformanceRecommendations(),
        systemInfo: this.getSystemInfo()
      };

      const reportPath = path.join(__dirname, '../../performance-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log('效能報告已生成:', reportPath);
      return report;
    } catch (error) {
      console.error('生成效能報告失敗:', error.message);
      throw error;
    }
  }

  static getSystemInfo() {
    const os = require('os');
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model,
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  }

  static async generateHTMLReport() {
    const report = await this.generate();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>效能報告 - 龜馬山志工排班系統</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .metric { border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px; }
        .good { border-left: 5px solid #4CAF50; }
        .warning { border-left: 5px solid #ff9800; }
        .critical { border-left: 5px solid #f44336; }
        .recommendation { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>效能報告 - 龜馬山志工排班系統</h1>
    
    <div class="summary">
        <h2>效能摘要</h2>
        <p>系統運行時間: ${report.summary.uptime}</p>
        <p>每秒請求數: ${report.summary.requestsPerSecond}</p>
        <p>記憶體使用率: ${report.summary.memoryUsage}</p>
        <p>CPU使用率: ${report.summary.cpuUsage}</p>
        <p>快取命中率: ${report.summary.cacheHitRate}</p>
        <p>活躍連接數: ${report.summary.activeConnections}</p>
        <p>慢查詢數: ${report.summary.slowQueries}</p>
    </div>

    <h2>效能指標</h2>
    <div class="metric">
        <h3>記憶體</h3>
        <p>使用率: ${report.metrics.memory.usage.toFixed(2)}%</p>
        <p>已使用: ${(report.metrics.memory.used / (1024 * 1024)).toFixed(2)} MB</p>
    </div>

    <div class="metric">
        <h3>快取</h3>
        <p>命中率: ${report.metrics.cache.hitRate.toFixed(2)}%</p>
        <p>命中次數: ${report.metrics.cache.hits}</p>
        <p>未命中次數: ${report.metrics.cache.misses}</p>
    </div>

    <div class="metric">
        <h3>請求</h3>
        <p>總請求數: ${report.metrics.requests.total}</p>
        <p>當前活躍: ${report.metrics.requests.current}</p>
        <p>每秒請求: ${report.metrics.requests.perSecond.toFixed(2)}</p>
    </div>

    <h2>效能建議</h2>
    ${report.recommendations.map(rec => 
      `<div class="recommendation">${rec}</div>`
    ).join('')}

    <h2>系統資訊</h2>
    <div class="metric">
        <p>平台: ${report.systemInfo.platform}</p>
        <p>架構: ${report.systemInfo.arch}</p>
        <p>總記憶體: ${(report.systemInfo.totalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
        <p>CPU核心數: ${report.systemInfo.cpuCount}</p>
    </div>
</body>
</html>
    `;

    const htmlPath = path.join(__dirname, '../../performance-report.html');
    fs.writeFileSync(htmlPath, html);
    
    console.log('HTML效能報告已生成:', htmlPath);
  }
}

module.exports = PerformanceReportGenerator;
