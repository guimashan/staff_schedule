// backend/scripts/securityReport.js
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

class SecurityReportGenerator {
  static async generate() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        summary: await this.getSecuritySummary(),
        vulnerabilities: await this.checkVulnerabilities(),
        recommendations: this.getRecommendations()
      };

      const reportPath = path.join(__dirname, '../../security-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log('安全報告已生成:', reportPath);
      return report;
    } catch (error) {
      console.error('生成安全報告失敗:', error.message);
      throw error;
    }
  }

  static async getSecuritySummary() {
    // 獲取安全相關統計
    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const activeUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE status = ?', ['active'], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const adminUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      securityScore: this.calculateSecurityScore(totalUsers, activeUsers, adminUsers)
    };
  }

  static async checkVulnerabilities() {
    const vulnerabilities = [];

    // 檢查管理員帳號數量
    const adminCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (adminCount > 5) {
      vulnerabilities.push({
        type: 'HIGH_ADMIN_COUNT',
        severity: 'MEDIUM',
        description: '管理員帳號數量過多，建議限制管理員數量',
        recommendation: '限制管理員帳號數量，實行最小權限原則'
      });
    }

    // 檢查停用帳號
    const inactiveUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE status = ?', ['inactive'], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (inactiveUsers > 0) {
      vulnerabilities.push({
        type: 'INACTIVE_ACCOUNTS',
        severity: 'LOW',
        description: `存在 ${inactiveUsers} 個停用帳號，建議定期清理`,
        recommendation: '定期清理停用帳號或實施帳號自動停用機制'
      });
    }

    return vulnerabilities;
  }

  static getRecommendations() {
    return [
      '實施多因素認證 (MFA)',
      '定期進行安全審計',
      '實施最小權限原則',
      '定期更新密碼策略',
      '實施會話管理',
      '加強輸入驗證',
      '實施速率限制',
      '定期備份資料'
    ];
  }

  static calculateSecurityScore(totalUsers, activeUsers, adminUsers) {
    let score = 100;
    
    // 管理員比例過高扣分
    if (adminUsers > 0 && totalUsers > 0) {
      const adminRatio = adminUsers / totalUsers;
      if (adminRatio > 0.1) score -= 20; // 管理員比例超過10%扣分
      else if (adminRatio > 0.05) score -= 10; // 管理員比例超過5%扣分
    }
    
    // 安全性調整
    score = Math.max(0, Math.min(100, score));
    return Math.round(score);
  }
}

module.exports = SecurityReportGenerator;
