// frontend/src/utils/performance.js
import { scheduleAPI } from '../services/api';
import { volunteerAPI } from '../services/api';

class FrontendPerformance {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.metrics = {
      renderCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      memoryUsage: 0
    };
  }

  // 資料快取
  async cachedFetch(key, fetchFunction, ttl = 300000) { // 5分鐘
    const now = Date.now();
    
    // 檢查快取
    if (this.cache.has(key) && this.cacheExpiry.get(key) > now) {
      this.metrics.cacheHits++;
      return this.cache.get(key);
    }
    
    this.metrics.cacheMisses++;
    const data = await fetchFunction();
    
    // 設定快取
    this.cache.set(key, data);
    this.cacheExpiry.set(key, now + ttl);
    
    // 清理過期快取
    this.cleanupExpiredCache();
    
    return data;
  }

  // 清理過期快取
  cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (expiry <= now) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // 批量載入優化
  async batchLoad(volunteerIds) {
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < volunteerIds.length; i += batchSize) {
      const batch = volunteerIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(id => this.cachedFetch(`volunteer_${id}`, () => volunteerAPI.getById(id)))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // 虛擬滾動優化
  virtualizeData(data, startIndex, endIndex) {
    return data.slice(startIndex, endIndex);
  }

  // 圖片懶載入
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // 記憶體使用監控
  monitorMemory() {
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }
    return this.metrics.memoryUsage;
  }

  // 渲染效能優化
  optimizeRendering(Component, props, container) {
    this.metrics.renderCount++;
    
    // 使用 React.memo 包裝組件
    const MemoizedComponent = React.memo(Component);
    
    // 使用 React.lazy 和 Suspense
    const LazyComponent = React.lazy(() => 
      import(`./components/${Component.name}`)
    );
    
    return (
      <React.Suspense fallback={<div>載入中...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  }

  // 網路請求優化
  async optimizedRequest(apiCall, ...args) {
    this.metrics.networkRequests++;
    
    try {
      const response = await apiCall(...args);
      return response;
    } catch (error) {
      // 重試機制
      if (error.response?.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await apiCall(...args);
      }
      throw error;
    }
  }

  // 效能指標報告
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0 ?
        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0,
      cacheSize: this.cache.size
    };
  }

  // 重置指標
  resetMetrics() {
    this.metrics = {
      renderCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      memoryUsage: 0
    };
  }
}

export default new FrontendPerformance();
