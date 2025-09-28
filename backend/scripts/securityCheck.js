// backend/scripts/securityCheck.js
const fs = require('fs');
const path = require('path');

class SecurityChecker {
  static checkSecurity() {
    const checks = {
      environment: this.checkEnvironment(),
      files: this.checkFiles(),
      permissions: this.checkPermissions(),
      configurations: this.checkConfigurations()
    };

    const hasIssues = Object.values(checks).some(category => 
      category.issues && category.issues.length > 0
    );

    console.log('=== 安全檢查報告 ===');
    console.log('環境檢查:', checks.environment.status);
    console.log('檔案檢查:', checks.files.status);
    console.log('權限檢查:', checks.permissions.status);
    console.log('配置檢查:', checks.configurations.status);
    console.log('發現問題:', hasIssues ? '是' : '否');

    return { checks, hasIssues };
  }

  static checkEnvironment() {
    const issues = [];
    
    if (process.env.NODE_ENV !== 'production') {
      issues.push('環境變數 NODE_ENV 不是 production');
    }
    
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret') {
      issues.push('JWT_SECRET 未設定或使用預設值');
    }

    return {
      status: issues.length === 0 ? 'PASSED' : 'FAILED',
      issues
    };
  }

  static checkFiles() {
    const issues = [];
    const sensitiveFiles = ['.env', 'package-lock.json', 'node_modules'];
    
    // 檢查敏感檔案是否在不當位置
    if (fs.existsSync(path.join(__dirname, '../../../.env'))) {
      issues.push('.env 檔案可能暴露在公開目錄');
    }

    return {
      status: issues.length === 0 ? 'PASSED' : 'FAILED',
      issues
    };
  }

  static checkPermissions() {
    const issues = [];
    
    // 檢查資料庫檔案權限
    const dbPath = path.join(__dirname, '../../database.db');
    if (fs.existsSync(dbPath)) {
      try {
        const stats = fs.statSync(dbPath);
        const permissions = stats.mode.toString(8).slice(-3);
        
        if (permissions[2] === '7') { // 其他用戶可執行
          issues.push('資料庫檔案權限過於寬鬆');
        }
      } catch (error) {
        issues.push('無法檢查資料庫檔案權限');
      }
    }

    return {
      status: issues.length === 0 ? 'PASSED' : 'FAILED',
      issues
    };
  }

  static checkConfigurations() {
    const issues = [];
    
    // 檢查是否啟用了錯誤詳細資訊
    if (process.env.NODE_ENV === 'development') {
      issues.push('開發模式下錯誤資訊可能洩露敏感資訊');
    }

    // 檢查速率限制配置
    if (!process.env.RATE_LIMIT_MAX || parseInt(process.env.RATE_LIMIT_MAX) > 1000) {
      issues.push('速率限制配置可能過於寬鬆');
    }

    return {
      status: issues.length === 0 ? 'PASSED' : 'FAILED',
      issues
    };
  }
}

if (require.main === module) {
  SecurityChecker.checkSecurity();
}

module.exports = SecurityChecker;
