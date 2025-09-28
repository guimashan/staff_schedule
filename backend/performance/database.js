// backend/performance/database.js
const db = require('../config/database');
const performanceConfig = require('../config/performance');
const cacheManager = require('./cache');

class DatabaseOptimizer {
  constructor() {
    this.queryStats = {
      totalQueries: 0,
      slowQueries: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0
    };
  }

  // 查詢計時器
  async executeWithTiming(query, params = []) {
    const startTime = Date.now();
    
    try {
      const result = await new Promise((resolve, reject) => {
        if (Array.isArray(params) && params.length === 0) {
          db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        }
      });

      const executionTime = Date.now() - startTime;
      
      // 更新統計
      this.queryStats.totalQueries++;
      this.queryStats.totalExecutionTime += executionTime;
      this.queryStats.averageExecutionTime = 
        this.queryStats.totalExecutionTime / this.queryStats.totalQueries;
      
      // 檢查慢查詢
      if (executionTime > performanceConfig.monitoring.slowQueryThreshold) {
        this.queryStats.slowQueries++;
        console.warn(`慢查詢警告: ${query} - ${executionTime}ms`);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // 批量查詢優化
  async batchQuery(queries) {
    const results = [];
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let completed = 0;
        const startTime = Date.now();
        
        queries.forEach((query, index) => {
          db.run(query.query, query.params || [], function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            completed++;
            if (completed === queries.length) {
              db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  const executionTime = Date.now() - startTime;
                  console.log(`批量查詢完成，耗時: ${executionTime}ms`);
                  resolve(true);
                }
              });
            }
          });
        });
      });
    });
  }

  // 查詢結果快取
  async cachedQuery(query, params = [], cacheKey, ttl = 300) {
    if (!cacheKey) {
      cacheKey = `query_${query}_${JSON.stringify(params)}`;
    }

    return await cacheManager.autoCache(cacheKey, async () => {
      return await this.executeWithTiming(query, params);
    }, ttl);
  }

  // 分頁查詢優化
  async paginatedQuery(baseQuery, params = [], page = 1, limit = 10, orderBy = 'id') {
    const offset = (page - 1) * limit;
    
    // 獲取總數
    const countQuery = baseQuery.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as count FROM');
    const countResult = await this.executeWithTiming(countQuery, params);
    const total = countResult[0]?.count || 0;
    
    // 獲取分頁資料
    const paginatedQuery = `${baseQuery} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, limit, offset];
    const data = await this.executeWithTiming(paginatedQuery, paginatedParams);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  // 索引優化建議
  async getQueryOptimizationSuggestions(query) {
    // 檢查是否有缺失的索引
    const suggestions = [];
    
    // 檢查WHERE子句
    if (query.toUpperCase().includes('WHERE')) {
      // 檢查常見的WHERE條件欄位是否需要索引
      const whereMatches = query.match(/WHERE\s+(.*?)(?:ORDER|GROUP|LIMIT|$)/i);
      if (whereMatches) {
        const whereClause = whereMatches[1];
        if (whereClause.includes('volunteer_id')) {
          suggestions.push('建議在 volunteer_id 欄位建立索引');
        }
        if (whereClause.includes('status')) {
          suggestions.push('建議在 status 欄位建立索引');
        }
        if (whereClause.includes('created_at')) {
          suggestions.push('建議在 created_at 欄位建立索引');
        }
      }
    }
    
    // 檢查ORDER BY子句
    if (query.toUpperCase().includes('ORDER BY')) {
      const orderMatches = query.match(/ORDER BY\s+(.*?)(?:LIMIT|$)/i);
      if (orderMatches) {
        const orderByClause = orderMatches[1];
        if (orderByClause.includes('created_at')) {
          suggestions.push('建議在排序欄位建立索引以提高效能');
        }
      }
    }
    
    return suggestions;
  }

  // 查詢效能分析
  async analyzeQueryPerformance(query, params = []) {
    const analysis = {
      query,
      params,
      executionTime: 0,
      resultCount: 0,
      suggestions: []
    };

    const startTime = Date.now();
    const result = await this.executeWithTiming(query, params);
    analysis.executionTime = Date.now() - startTime;
    analysis.resultCount = result.length;
    analysis.suggestions = await this.getQueryOptimizationSuggestions(query);

    return analysis;
  }

  // 獲取資料庫效能統計
  getStats() {
    return {
      ...this.queryStats,
      cacheStats: cacheManager.getStats()
    };
  }

  // 建立常用索引
  async createOptimizedIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers (status)',
      'CREATE INDEX IF NOT EXISTS idx_volunteers_department ON volunteers (department)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_volunteer_id ON schedules (volunteer_id)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules (start_time)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules (status)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_shift_type ON schedules (shift_type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_volunteer_id ON attendance (volunteer_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance (status)'
    ];

    for (const index of indexes) {
      await new Promise((resolve, reject) => {
        db.run(index, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('資料庫索引優化完成');
  }

  // 資料庫清理優化
  async cleanupDatabase() {
    const cleanupQueries = [
      // 清理過期的通知
      'DELETE FROM notifications WHERE created_at < datetime("now", "-30 days") AND is_read = 1',
      // 清理過期的快取資料
      'DELETE FROM cache WHERE expires_at < datetime("now")',
      // 重新整理資料庫
      'VACUUM',
      'ANALYZE'
    ];

    for (const query of cleanupQueries) {
      await new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('資料庫清理優化完成');
  }
}

module.exports = new DatabaseOptimizer();
