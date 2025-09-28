// backend/performance/cache.js
const NodeCache = require('node-cache');
const config = require('../config/performance');

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.ttl * 2,
      maxKeys: config.cache.max,
      useClones: false
    });
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // 獲取快取
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    } else {
      this.stats.misses++;
      return null;
    }
  }

  // 設定快取
  set(key, value, ttl = config.cache.ttl) {
    const success = this.cache.set(key, value, ttl);
    if (success) {
      this.stats.sets++;
    }
    return success;
  }

  // 刪除快取
  delete(key) {
    const deleted = this.cache.del(key);
    this.stats.deletes += deleted;
    return deleted > 0;
  }

  // 清除所有快取
  flush() {
    this.cache.flushAll();
    this.resetStats();
  }

  // 獲取快取統計
  getStats() {
    const keys = this.cache.keys();
    return {
      ...this.stats,
      totalKeys: keys.length,
      hitRate: this.stats.hits + this.stats.misses > 0 ? 
        (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 : 0,
      memoryUsage: this.cache.getStats()
    };
  }

  // 重置統計
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // 獲取快取鍵列表
  getKeys() {
    return this.cache.keys();
  }

  // 檢查鍵是否存在
  has(key) {
    return this.cache.has(key);
  }

  // 多鍵操作
  mget(keys) {
    const result = {};
    keys.forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    });
    return result;
  }

  // 批量設定
  mset(items) {
    const results = {};
    for (const [key, value] of Object.entries(items)) {
      results[key] = this.set(key, value);
    }
    return results;
  }

  // 自動快取裝飾器
  async autoCache(key, fetchFunction, ttl = config.cache.ttl) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFunction();
    this.set(key, value, ttl);
    return value;
  }

  // 條件快取
  conditionalCache(key, fetchFunction, condition, ttl = config.cache.ttl) {
    if (condition) {
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }
    }

    const value = fetchFunction();
    if (condition) {
      this.set(key, value, ttl);
    }
    return value;
  }
}

// 單例模式
const cacheManager = new CacheManager();
module.exports = cacheManager;
