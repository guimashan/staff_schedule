// tests/unit/volunteer.test.js
const { testDb } = require('../setup/testSetup');
const testData = require('../fixtures/testData');

describe('志工管理單元測試', () => {
  let volunteerId;

  beforeEach(async () => {
    // 清空測試資料
    await new Promise((resolve) => {
      testDb.run('DELETE FROM volunteers', resolve);
    });
  });

  test('新增志工', async () => {
    const newVolunteer = testData.volunteers[0];
    
    const result = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department, skills, experience_years, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        newVolunteer.name,
        newVolunteer.phone,
        newVolunteer.email,
        newVolunteer.department,
        newVolunteer.skills,
        newVolunteer.experience_years,
        newVolunteer.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    expect(result).toBeGreaterThan(0);
    volunteerId = result;

    // 驗證資料是否正確插入
    const volunteer = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM volunteers WHERE id = ?', [result], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(volunteer.name).toBe(newVolunteer.name);
    expect(volunteer.email).toBe(newVolunteer.email);
    expect(volunteer.status).toBe(newVolunteer.status);
  });

  test('查詢志工', async () => {
    // 先新增測試資料
    const newVolunteer = testData.volunteers[1];
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department, skills, experience_years, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        newVolunteer.name,
        newVolunteer.phone,
        newVolunteer.email,
        newVolunteer.department,
        newVolunteer.skills,
        newVolunteer.experience_years,
        newVolunteer.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 查詢志工
    const volunteer = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM volunteers WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(volunteer).toBeDefined();
    expect(volunteer.name).toBe(newVolunteer.name);
    expect(volunteer.department).toBe(newVolunteer.department);
  });

  test('更新志工資料', async () => {
    // 先新增測試資料
    const newVolunteer = testData.volunteers[0];
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department, skills, experience_years, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        newVolunteer.name,
        newVolunteer.phone,
        newVolunteer.email,
        newVolunteer.department,
        newVolunteer.skills,
        newVolunteer.experience_years,
        newVolunteer.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 更新志工
    const updatedName = '更新後的志工姓名';
    await new Promise((resolve, reject) => {
      testDb.run(`
        UPDATE volunteers 
        SET name = ?, department = ?
        WHERE id = ?
      `, [updatedName, '活動策劃', insertResult], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 驗證更新結果
    const updatedVolunteer = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM volunteers WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(updatedVolunteer.name).toBe(updatedName);
    expect(updatedVolunteer.department).toBe('活動策劃');
  });

  test('刪除志工', async () => {
    // 先新增測試資料
    const newVolunteer = testData.volunteers[1];
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department, skills, experience_years, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        newVolunteer.name,
        newVolunteer.phone,
        newVolunteer.email,
        newVolunteer.department,
        newVolunteer.skills,
        newVolunteer.experience_years,
        newVolunteer.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 刪除志工
    await new Promise((resolve, reject) => {
      testDb.run('DELETE FROM volunteers WHERE id = ?', [insertResult], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 驗證是否已刪除
    const deletedVolunteer = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM volunteers WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(deletedVolunteer).toBeUndefined();
  });

  test('志工搜尋功能', async () => {
    // 新增多筆測試資料
    const volunteers = [
      { name: '張三', email: 'zhang@example.com', department: '接待服務' },
      { name: '李四', email: 'li@example.com', department: '導覽解說' },
      { name: '王五', email: 'wang@example.com', department: '接待服務' }
    ];

    for (const volunteer of volunteers) {
      await new Promise((resolve, reject) => {
        testDb.run(`
          INSERT INTO volunteers (name, phone, email, department)
          VALUES (?, ?, ?, ?)
        `, [volunteer.name, '0912345678', volunteer.email, volunteer.department], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 搜尋測試
    const searchResults = await new Promise((resolve, reject) => {
      testDb.all('SELECT * FROM volunteers WHERE department = ?', ['接待服務'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    expect(searchResults.length).toBe(2);
    expect(searchResults.every(vol => vol.department === '接待服務')).toBe(true);
  });
});
