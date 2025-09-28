// tests/unit/errorHandling.test.js
const { testDb } = require('../setup/testSetup');

describe('錯誤處理測試', () => {
  test('資料庫連接錯誤處理', async () => {
    // 測試資料庫操作錯誤
    await expect(new Promise((resolve, reject) => {
      testDb.run('INSERT INTO non_existent_table (name) VALUES (?)', ['test'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    })).rejects.toThrow();
  });

  test('無效資料插入測試', async () => {
    // 測試插入無效資料
    await expect(new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department)
        VALUES (?, ?, ?, ?)
      `, [null, '0912345678', 'test@example.com', '接待服務'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    })).rejects.toThrow();
  });

  test('重複資料插入測試', async () => {
    // 先插入一筆資料
    await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department)
        VALUES (?, ?, ?, ?)
      `, ['重複測試', '0912345678', 'duplicate@example.com', '接待服務'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 嘗試插入重複的電子郵件
    await expect(new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department)
        VALUES (?, ?, ?, ?)
      `, ['重複測試2', '0912345679', 'duplicate@example.com', '導覽解說'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    })).rejects.toThrow();
  });

  test('資料庫查詢錯誤處理', async () => {
    // 測試無效查詢
    await expect(new Promise((resolve, reject) => {
      testDb.all('SELECT * FROM non_existent_table', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })).rejects.toThrow();
  });

  test('資料庫更新錯誤處理', async () => {
    // 測試更新不存在的記錄
    await expect(new Promise((resolve, reject) => {
      testDb.run('UPDATE volunteers SET name = ? WHERE id = ?', ['新名字', 999999], (err) => {
        if (err) reject(err);
        else resolve();
      });
    })).rejects.toThrow();
  });

  test('資料庫刪除錯誤處理', async () => {
    // 測試刪除不存在的記錄
    await expect(new Promise((resolve, reject) => {
      testDb.run('DELETE FROM volunteers WHERE id = ?', [999999], (err) => {
        if (err) reject(err);
        else resolve();
      });
    })).rejects.toThrow();
  });
});
