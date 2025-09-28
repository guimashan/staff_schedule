// production/monitoring/alerts.js
const nodemailer = require('nodemailer');
const performanceMonitor = require('../../backend/performance/monitoring');

class AlertSystem {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.alertThresholds = {
      memoryUsage: 80, // 記憶體使用率
      responseTime: 2000, // 響應時間 (ms)
      errorRate: 5, // 錯誤率 (%)
      uptime: 99.9 // 系統可用性 (%)
    };

    this.alertCooldown = 300000; // 5分鐘冷卻時間
    this.lastAlerts = {};
  }

  // 檢查系統狀態並發送警報
  async checkSystemStatus() {
    const metrics = performanceMonitor.getMetrics();
    const alerts = [];

    // 檢查記憶體使用率
    if (metrics.memory.usage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        message: `記憶體使用率過高: ${metrics.memory.usage.toFixed(2)}%`,
        severity: 'HIGH'
      });
    }

    // 檢查響應時間
    if (metrics.requests.perSecond > 0 && metrics.requests.perSecond > 100) {
      alerts.push({
        type: 'HIGH_REQUEST_RATE',
        message: `請求率過高: ${metrics.requests.perSecond.toFixed(2)}/s`,
        severity: 'MEDIUM'
      });
    }

    // 檢查快取命中率
    if (metrics.cache.hitRate < 70) {
      alerts.push({
        type: 'LOW_CACHE_HIT_RATE',
        message: `快取命中率過低: ${metrics.cache.hitRate.toFixed(2)}%`,
        severity: 'MEDIUM'
      });
    }

    // 發送警報
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  // 發送警報
  async sendAlert(alert) {
    const now = Date.now();
    const cooldownKey = `${alert.type}_${alert.severity}`;

    // 檢查冷卻時間
    if (this.lastAlerts[cooldownKey] && 
        now - this.lastAlerts[cooldownKey] < this.alertCooldown) {
      return;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL || 'admin@example.com',
        subject: `[警報] 龜馬山志工排班系統 - ${alert.type}`,
        html: `
          <h2>系統警報</h2>
          <p><strong>類型:</strong> ${alert.type}</p>
          <p><strong>嚴重程度:</strong> ${alert.severity}</p>
          <p><strong>訊息:</strong> ${alert.message}</p>
          <p><strong>時間:</strong> ${new Date().toISOString()}</p>
          <p><strong>建議:</strong> 請立即檢查系統狀態並採取相應措施</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.lastAlerts[cooldownKey] = now;

      console.log(`警報已發送: ${alert.type} - ${alert.message}`);
    } catch (error) {
      console.error('發送警報失敗:', error.message);
    }
  }

  // 運行監控循環
  startMonitoring() {
    setInterval(() => {
      this.checkSystemStatus().catch(error => {
        console.error('監控檢查失敗:', error.message);
      });
    }, 60000); // 每分鐘檢查一次

    console.log('系統監控已啟動');
  }

  // 檢查系統健康狀態
  async checkHealth() {
    try {
      const response = await fetch('http://localhost/api/health');
      const health = await response.json();
      
      return {
        healthy: health.status === 'healthy',
        timestamp: health.timestamp,
        uptime: health.uptime
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // 系統性能評估
  async evaluatePerformance() {
    const metrics = performanceMonitor.getMetrics();
    
    const performanceScore = {
      score: 0,
      breakdown: {
        memory: Math.max(0, 100 - metrics.memory.usage),
        cache: metrics.cache.hitRate || 0,
        requests: Math.min(100, (100 / Math.max(1, metrics.requests.perSecond)) * 100)
      }
    };

    performanceScore.score = Object.values(performanceScore.breakdown)
      .reduce((sum, score) => sum + score, 0) / 3;

    return performanceScore;
  }

  // 生成系統報告
  async generateSystemReport() {
    const health = await this.checkHealth();
    const performance = await this.evaluatePerformance();
    const metrics = performanceMonitor.getMetrics();

    return {
      timestamp: new Date().toISOString(),
      health,
      performance,
      metrics,
      recommendations: this.getRecommendations(metrics)
    };
  }

  // 獲取系統建議
  getRecommendations(metrics) {
    const recommendations = [];

    if (metrics.memory.usage > 80) {
      recommendations.push('建議優化記憶體使用或增加系統資源');
    }

    if (metrics.cache.hitRate < 70) {
      recommendations.push('建議優化快取策略以提高效能');
    }

    if (metrics.requests.perSecond > 100) {
      recommendations.push('建議實施負載均衡或速率限制');
    }

    if (metrics.database.slowQueries > 10) {
      recommendations.push('建議優化資料庫查詢');
    }

    return recommendations;
  }
}

module.exports = new AlertSystem();
