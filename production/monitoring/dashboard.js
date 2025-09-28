// production/monitoring/dashboard.js
const express = require('express');
const router = express.Router();
const alertSystem = require('./alerts');
const performanceMonitor = require('../../backend/performance/monitoring');

// 監控儀表板路由
router.get('/dashboard', async (req, res) => {
  try {
    const report = await alertSystem.generateSystemReport();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>系統監控儀表板 - 龜馬山志工排班系統</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
              .container { max-width: 1200px; margin: 0 auto; }
              .card { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .health-indicator { display: inline-block; padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
              .healthy { background: #4CAF50; }
              .unhealthy { background: #f44336; }
              .warning { background: #ff9800; }
              .metric { display: inline-block; margin: 10px; padding: 15px; border-radius: 5px; background: #e3f2fd; min-width: 150px; text-align: center; }
              .chart { height: 200px; display: flex; align-items: flex-end; gap: 2px; padding: 10px; background: #f0f0f0; margin: 10px 0; }
              .bar { flex: 1; background: #2196F3; min-width: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>系統監控儀表板</h1>
              
              <div class="card">
                  <h2>系統健康狀態</h2>
                  <div class="health-indicator ${report.health.healthy ? 'healthy' : 'unhealthy'}">
                      ${report.health.healthy ? '正常' : '異常'}
                  </div>
                  <p>更新時間: ${report.timestamp}</p>
                  <p>系統運行時間: ${report.health.uptime ? (report.health.uptime / 3600).toFixed(2) + ' 小時' : '未知'}</p>
              </div>

              <div class="card">
                  <h2>效能評分</h2>
                  <div class="metric">
                      <div style="font-size: 2em; font-weight: bold; color: #2196F3;">${report.performance.score.toFixed(1)}</div>
                      <div>總體效能分數</div>
                  </div>
                  
                  <div style="margin-top: 20px;">
                      <h3>效能細項</h3>
                      <div class="metric">
                          <div style="font-size: 1.5em;">${report.performance.breakdown.memory.toFixed(1)}</div>
                          <div>記憶體效能</div>
                      </div>
                      <div class="metric">
                          <div style="font-size: 1.5em;">${report.performance.breakdown.cache.toFixed(1)}</div>
                          <div>快取效能</div>
                      </div>
                      <div class="metric">
                          <div style="font-size: 1.5em;">${report.performance.breakdown.requests.toFixed(1)}</div>
                          <div>請求效能</div>
                      </div>
                  </div>
              </div>

              <div class="card">
                  <h2>系統指標</h2>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                      <div>
                          <h3>記憶體使用</h3>
                          <div class="chart">
                              ${'<div class="bar" style="height: ' + report.metrics.memory.usage + '%;"></div>'.repeat(1)}
                          </div>
                          <p>使用率: ${report.metrics.memory.usage.toFixed(2)}%</p>
                      </div>
                      <div>
                          <h3>快取效能</h3>
                          <div class="chart">
                              ${'<div class="bar" style="height: ' + report.metrics.cache.hitRate + '%;"></div>'.repeat(1)}
                          </div>
                          <p>命中率: ${report.metrics.cache.hitRate.toFixed(2)}%</p>
                      </div>
                      <div>
                          <h3>請求處理</h3>
                          <p>總請求: ${report.metrics.requests.total}</p>
                          <p>每秒請求: ${report.metrics.requests.perSecond.toFixed(2)}</p>
                          <p>當前活躍: ${report.metrics.requests.current}</p>
                      </div>
                  </div>
              </div>

              <div class="card">
                  <h2>系統建議</h2>
                  <ul>
                      ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                  </ul>
              </div>
          </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API端點 - 獲取實時數據
router.get('/api/realtime', async (req, res) => {
  try {
    const report = await alertSystem.generateSystemReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API端點 - 觸發手動警報檢查
router.post('/api/check-alerts', async (req, res) => {
  try {
    await alertSystem.checkSystemStatus();
    res.json({ message: '警報檢查完成' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
