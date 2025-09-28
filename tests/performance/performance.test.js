// tests/performance/performance.test.js
const { test } = require('@playwright/test');

test.describe('效能測試', () => {
  test('頁面載入時間測試', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    
    // 等待所有資源加載完成
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`頁面載入時間: ${loadTime}ms`);
    
    // 確保載入時間在合理範圍內 (小於3秒)
    test.expect(loadTime).toBeLessThan(3000);
  });

  test('API回應時間測試', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/api/volunteers');
    
    const responseTime = Date.now() - startTime;
    
    console.log(`API回應時間: ${responseTime}ms`);
    
    // 確保API回應時間在合理範圍內 (小於1秒)
    test.expect(responseTime).toBeLessThan(1000);
    test.expect(response.status()).toBe(200);
  });

  test('大量資料載入測試', async ({ page }) => {
    // 模擬大量志工資料
    const largeVolunteerList = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `志工${i + 1}`,
      phone: `09${String(i + 1).padStart(8, '0')}`,
      email: `volunteer${i + 1}@example.com`,
      department: '接待服務'
    }));

    // 測試大量資料載入性能
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/volunteers');
    
    // 等待資料載入
    await page.waitForSelector('.MuiTable-root');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`大量資料載入時間: ${loadTime}ms`);
    
    // 確保載入時間在合理範圍內 (小於5秒)
    test.expect(loadTime).toBeLessThan(5000);
  });

  test('記憶體使用測試', async ({ page }) => {
    // 獲取初始記憶體使用量
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // 執行一些操作
    await page.goto('http://localhost:3000/volunteers');
    await page.waitForSelector('button');
    
    // 點擊新增按鈕
    const addButtons = await page.$$('button');
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape'); // 關閉表單
    }

    // 獲取操作後的記憶體使用量
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

    console.log(`記憶體使用增加: ${memoryIncreaseMB.toFixed(2)} MB`);
    
    // 確保記憶體使用量在合理範圍內
    test.expect(memoryIncreaseMB).toBeLessThan(50); // 小於50MB
  });
});
