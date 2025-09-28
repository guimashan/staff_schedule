// production/backup/backup.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const performanceMonitor = require('../../backend/performance/monitoring');

const execAsync = promisify(exec);

class BackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, '../../../backups');
    this.maxBackups = 30; // 保留30天的備份
    this.backupSchedule = '0 2 * * *'; // 每天凌晨2點執行
    
    // 確保備份目錄存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // 執行資料庫備份
  async backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `database_${timestamp}.db`);
    
    try {
      // 使用 SQLite 的 .backup 命令
      await execAsync(`sqlite3 ${process.env.DB_PATH || './database.db'} ".backup '${backupFile}'"`);
      
      console.log(`資料庫備份完成: ${backupFile}`);
      
      // 記錄備份日誌
      this.logBackup('database', backupFile, true);
      
      // 清理舊備份
      await this.cleanupOldBackups();
      
      return backupFile;
    } catch (error) {
      console.error('資料庫備份失敗:', error.message);
      this.logBackup('database', backupFile, false, error.message);
      throw error;
    }
  }

  // 執行系統配置備份
  async backupConfig() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `config_${timestamp}.tar.gz`);
    
    try {
      const configFiles = [
        './.env',
        './deploy/',
        './backend/config/',
        './frontend/config/',
        './package.json',
        './package-lock.json'
      ].filter(file => fs.existsSync(file));
      
      if (configFiles.length > 0) {
        const files = configFiles.join(' ');
        await execAsync(`tar -czf ${backupFile} ${files}`);
        
        console.log(`配置備份完成: ${backupFile}`);
        this.logBackup('config', backupFile, true);
      }
      
      return backupFile;
    } catch (error) {
      console.error('配置備份失敗:', error.message);
      this.logBackup('config', backupFile, false, error.message);
      throw error;
    }
  }

  // 執行完整備份
  async backupFull() {
    console.log('開始完整系統備份...');
    
    const backupResults = {
      database: null,
      config: null,
      timestamp: new Date().toISOString()
    };
    
    try {
      backupResults.database = await this.backupDatabase();
      backupResults.config = await this.backupConfig();
      
      console.log('完整備份完成');
      return backupResults;
    } catch (error) {
      console.error('完整備份失敗:', error.message);
      throw error;
    }
  }

  // 清理舊備份
  async cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();
        const days = Math.floor(age / (1000 * 60 * 60 * 24));
        
        // 刪除超過30天的備份
        if (days > 30) {
          fs.unlinkSync(filePath);
          console.log(`已刪除舊備份: ${file}`);
        }
      }
    } catch (error) {
      console.error('清理備份失敗:', error.message);
    }
  }

  // 還原備份
  async restoreDatabase(backupFile) {
    if (!fs.existsSync(backupFile)) {
      throw new Error('備份檔案不存在');
    }
    
    const dbPath = process.env.DB_PATH || './database.db';
    
    try {
      // 停止相關服務 (如果需要)
      console.log('停止相關服務...');
      
      // 執行還原
      await execAsync(`sqlite3 ${dbPath} ".restore '${backupFile}'"`);
      
      console.log(`資料庫還原完成: ${dbPath}`);
      
      // 重新啟動服務 (如果需要)
      console.log('重新啟動服務...');
      
      return true;
    } catch (error) {
      console.error('資料庫還原失敗:', error.message);
      throw error;
    }
  }

  // 獲取備份列表
  getBackupList() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter(file => file.endsWith('.db') || file.endsWith('.tar.gz'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime,
            type: file.endsWith('.db') ? 'database' : 'config'
          };
        })
        .sort((a, b) => b.modified - a.modified);
      
      return backups;
    } catch (error) {
      console.error('獲取備份列表失敗:', error.message);
      return [];
    }
  }

  // 記錄備份日誌
  logBackup(type, file, success, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      file,
      success,
      error
    };
    
    const logFile = path.join(this.backupDir, 'backup.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  // 驗證備份完整性
  async validateBackup(backupFile) {
    try {
      if (backupFile.endsWith('.db')) {
        // 驗證 SQLite 檔案
        const { stdout } = await execAsync(`sqlite3 ${backupFile} "PRAGMA integrity_check;"`);
        return stdout.trim() === 'ok';
      } else if (backupFile.endsWith('.tar.gz')) {
        // 驗證 tar.gz 檔案
        await execAsync(`tar -tzf ${backupFile} > /dev/null`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('備份驗證失敗:', error.message);
      return false;
    }
  }

  // 開始定期備份
  startScheduledBackups() {
    const cron = require('node-cron');
    
    cron.schedule(this.backupSchedule, async () => {
      console.log('開始定時備份...');
      try {
        await this.backupFull();
        console.log('定時備份完成');
        
        // 發送備份完成通知
        this.sendBackupNotification('success');
      } catch (error) {
        console.error('定時備份失敗:', error.message);
        this.sendBackupNotification('failure', error.message);
      }
    });
    
    console.log('定時備份已啟動');
  }

  // 發送備份通知
  sendBackupNotification(status, error = null) {
    const message = status === 'success' 
      ? '系統備份已完成' 
      : `系統備份失敗: ${error}`;
    
    console.log(message);
    
    // 在實際應用中，這裡會發送郵件或通知
    // 例如: 發送到 Slack、Email 等
  }

  // 獲取備份統計
  getBackupStats() {
    const backups = this.getBackupList();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      totalBackups: backups.length,
      totalSize: totalSize,
      sizeInMB: (totalSize / (1024 * 1024)).toFixed(2),
      lastBackup: backups[0]?.modified || null
    };
  }
}

module.exports = new BackupSystem();
