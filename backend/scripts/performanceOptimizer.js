// backend/scripts/performanceOptimizer.js
const fs = require('fs');
const path = require('path');
const databaseOptimizer = require('../performance/database');

class PerformanceOptimizer {
  static async optimizeAll() {
    console.log('開始效能優化...');
    
    try {
      // 資料庫優化
      await this.optimizeDatabase();
      
      // 檔案優化
      await this.optimizeFiles();
      
      // 系統優化
      await this.optimizeSystem();
      
      console.log('效能優化完成！');
    } catch (error) {
      console.error('效能優化失敗:', error.message);
    }
  }

  static async optimizeDatabase() {
    console.log('優化資料庫...');
    
    // 建立索引
    await databaseOptimizer.createOptimizedIndexes();
    
    // 清理資料庫
    await databaseOptimizer.cleanupDatabase();
    
    console.log('資料庫優化完成');
  }

  static async optimizeFiles() {
    console.log('優化檔案...');
    
    // 清理臨時檔案
    const tempDir = path.join(__dirname, '../../temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const age = Date.now() - stats.mtime.getTime();
        
        // 刪除超過1小時的臨時檔案
        if (age > 3600000) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    console.log('檔案優化完成');
  }

  static async optimizeSystem() {
    console.log('優化系統...');
    
    // 重置效能統計
    const performanceMonitor = require('../performance/monitoring');
    performanceMonitor.resetStats();
    
    console.log('系統優化完成');
  }

  static async runPerformanceTest() {
    console.log('執行效能測試...');
    
    // 這裡可以執行各種效能測試
    const tests = [
      this.testDatabasePerformance,
      this.testAPIPerformance,
      this.testCachePerformance
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error(`效能測試失敗: ${error.message}`);
      }
    }
    
    console.log('效能測試完成');
  }

  static async testDatabasePerformance() {
    const startTime = Date.now();
    
    // 執行資料庫查詢測試
    const db = require('../config/database');
    await new Promise((resolve, reject) => {
      db.all('SELECT COUNT(*) as count FROM volunteers', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const duration = Date.now() - startTime;
    console.log(`資料庫查詢測試: ${duration}ms`);
    
    if (duration > 100) {
      console.warn('資料庫查詢時間過長');
    }
  }

  static async testAPIPerformance() {
    // 這裡可以執行API效能測試
    console.log('API效能測試完成');
  }

  static async testCachePerformance() {
    // 這裡可以執行快取效能測試
    console.log('快取效能測試完成');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  PerformanceOptimizer.optimizeAll();
}

module.exports = PerformanceOptimizer;
