// tests/e2e/main.test.js
const puppeteer = require('puppeteer');

describe('端到端測試', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: true, // 設為 false 可以看到瀏覽器
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('首頁加載測試', async () => {
    // 這個測試需要先啟動前端應用
    await page.goto('http://localhost:3000');
    
    // 等待頁面加載
    await page.waitForSelector('h1, .MuiTypography-root');
    
    const title = await page.title();
    expect(title).toContain('龜馬山志工排班系統');
    
    // 檢查是否存在主要導航元素
    const navigationExists = await page.$eval('nav', nav => nav !== null);
    expect(navigationExists).toBe(true);
  }, 30000); // 30秒超時

  test('志工列表頁面測試', async () => {
    await page.goto('http://localhost:3000/volunteers');
    
    // 等待志工列表加載
    await page.waitForSelector('.MuiTable-root');
    
    const pageContent = await page.content();
    expect(pageContent).toContain('志工管理');
    expect(pageContent).toContain('姓名');
    expect(pageContent).toContain('電話');
  }, 30000);

  test('排班管理頁面測試', async () => {
    await page.goto('http://localhost:3000/schedules');
    
    // 等待排班管理頁面加載
    await page.waitForSelector('[data-testid="schedule-calendar"]');
    
    const pageContent = await page.content();
    expect(pageContent).toContain('排班管理');
    expect(pageContent).toContain('日曆視圖');
    expect(pageContent).toContain('列表視圖');
  }, 30000);

  test('表單提交測試', async () => {
    await page.goto('http://localhost:3000/volunteers');
    
    // 等待頁面加載
    await page.waitForSelector('button');
    
    // 點擊新增志工按鈕
    const addVolunteerButton = await page.$('button:has-text("新增志工")');
    if (addVolunteerButton) {
      await addVolunteerButton.click();
      
      // 等待表單出現
      await page.waitForSelector('input[name="name"]');
      
      // 填寫表單
      await page.type('input[name="name"]', '測試志工');
      await page.type('input[name="phone"]', '0912345678');
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="department"]', '接待服務');
      
      // 提交表單
      const submitButton = await page.$('button:has-text("保存")');
      if (submitButton) {
        await submitButton.click();
        
        // 等待保存完成
        await page.waitForTimeout(2000);
        
        // 檢查是否出現成功訊息
        const successMessage = await page.$('.MuiAlert-message');
        expect(successMessage).not.toBeNull();
      }
    }
  }, 30000);

  test('搜索功能測試', async () => {
    await page.goto('http://localhost:3000/volunteers');
    
    // 等待頁面加載
    await page.waitForSelector('input[placeholder*="搜尋"]');
    
    // 輸入搜索關鍵字
    await page.type('input[placeholder*="搜尋"]', '測試');
    
    // 等待搜索結果
    await page.waitForTimeout(1000);
    
    const content = await page.content();
    expect(content.toLowerCase()).toContain('測試');
  }, 30000);

  test('錯誤處理測試', async () => {
    await page.goto('http://localhost:3000/volunteers');
    
    // 點擊新增志工按鈕
    const addVolunteerButton = await page.$('button:has-text("新增志工")');
    if (addVolunteerButton) {
      await addVolunteerButton.click();
      
      // 等待表單出現
      await page.waitForSelector('input[name="name"]');
      
      // 提交空表單
      const submitButton = await page.$('button:has-text("保存")');
      if (submitButton) {
        await submitButton.click();
        
        // 等待錯誤訊息出現
        await page.waitForTimeout(1000);
        
        // 檢查錯誤訊息
        const errorMessage = await page.$('.MuiAlert-message');
        expect(errorMessage).not.toBeNull();
      }
    }
  }, 30000);
});
