// tests/performance/performance.test.js
const request = require('supertest');
const app = require('../../backend/app');
const performanceMonitor = require('../../backend/performance/monitoring');

describe('效能測試', () => {
  test('API響應時間測試', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/volunteers')
      .expect(200);
    
    const responseTime = Date.now() - startTime;
    
    console.log(`API響應時間: ${responseTime}ms`);
    
    // 確保響應時間在合理範圍內 (小於500ms)
    expect(responseTime).toBeLessThan(500);
  });

  test('大量資料查詢效能', async () => {
    const startTime = Date.now();
    
    // 模擬大量資料查詢
    const response = await request(app)
      .get('/api/volunteers?limit=1000')
      .expect(200);
    
    const queryTime = Date.now() - startTime;
    
    console.log(`大量資料查詢時間: ${queryTime}ms`);
    console.log(`返回資料數量: ${response.body.length}`);
    
    expect(queryTime).toBeLessThan(2000); // 2秒內
    expect(response.body).toBeInstanceOf(Array);
  });

  test('並發請求效能', async () => {
    const startTime = Date.now();
    
    // 發送並發請求
    const requests = Array.from({ length: 10 }, () => 
      request(app).get('/api/volunteers').expect(200)
    );
    
    const responses = await Promise.all(requests);
    const concurrentTime = Date.now() - startTime;
    
    console.log(`並發請求時間: ${concurrentTime}ms`);
    console.log(`成功請求數: ${responses.length}`);
    
    expect(concurrentTime).toBeLessThan(3000); // 3秒內處理10個請求
  });

  test('效能監控指標', () => {
    const metrics = performanceMonitor.getMetrics();
    
    console.log('效能指標:', {
      memoryUsage: `${metrics.memory.usage.toFixed(2)}%`,
      requestsPerSecond: metrics.requests.perSecond.toFixed(2),
      cacheHitRate: `${metrics.cache.hitRate.toFixed(2)}%`
    });
    
    expect(metrics.memory.usage).toBeLessThan(90); // 記憶體使用率小於90%
    expect(metrics.cache.hitRate).toBeLessThan(100); // 快取命中率合理
  });

  test('快取效能測試', async () => {
    // 第一次請求
    const startTime1 = Date.now();
    await request(app).get('/api/volunteers').expect(200);
    const firstRequestTime = Date.now() - startTime1;
    
    // 第二次請求 (應該從快取獲取)
    const startTime2 = Date.now();
    await request(app).get('/api/volunteers').expect(200);
    const secondRequestTime = Date.now() - startTime2;
    
    console.log(`第一次請求時間: ${firstRequestTime}ms`);
    console.log(`第二次請求時間: ${secondRequestTime}ms`);
    console.log(`效能提升: ${((firstRequestTime - secondRequestTime) / firstRequestTime * 100).toFixed(2)}%`);
    
    // 快取應該比直接查詢更快
    expect(secondRequestTime).toBeLessThanOrEqual(firstRequestTime);
  });

  test('資料庫查詢效能優化', async () => {
    const startTime = Date.now();
    
    // 測試分頁查詢效能
    const response = await request(app)
      .get('/api/volunteers?page=1&limit=50')
      .expect(200);
    
    const queryTime = Date.now() - startTime;
    
    console.log(`分頁查詢時間: ${queryTime}ms`);
    console.log(`分頁資料數量: ${response.body.data.length}`);
    
    expect(queryTime).toBeLessThan(1000); // 1秒內
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
  });

  test('記憶體使用測試', () => {
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryMB = memoryUsage / (1024 * 1024);
    
    console.log(`記憶體使用量: ${memoryMB.toFixed(2)} MB`);
    
    // 確保記憶體使用量在合理範圍內
    expect(memoryMB).toBeLessThan(100); // 小於100MB
  });
});
