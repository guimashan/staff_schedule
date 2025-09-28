// tests/unit/schedule.test.js
const { testDb } = require('../setup/testSetup');
const testData = require('../fixtures/testData');

describe('排班管理單元測試', () => {
  let volunteerId;
  let scheduleId;

  beforeEach(async () => {
    // 清空測試資料
    await new Promise((resolve) => {
      testDb.run('DELETE FROM schedules', () => {
        testDb.run('DELETE FROM volunteers', resolve);
      });
    });

    // 新增測試志工
    const volunteer = testData.volunteers[0];
    volunteerId = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO volunteers (name, phone, email, department, status)
        VALUES (?, ?, ?, ?, ?)
      `, [volunteer.name, volunteer.phone, volunteer.email, volunteer.department, volunteer.status], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  });

  test('新增排班', async () => {
    const newSchedule = { ...testData.schedules[0], volunteer_id: volunteerId };
    
    scheduleId = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, location, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        newSchedule.volunteer_id,
        newSchedule.start_time,
        newSchedule.end_time,
        newSchedule.shift_type,
        newSchedule.location,
        newSchedule.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    expect(scheduleId).toBeGreaterThan(0);

    // 驗證資料是否正確插入
    const schedule = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM schedules WHERE id = ?', [scheduleId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(schedule.volunteer_id).toBe(volunteerId);
    expect(schedule.shift_type).toBe(newSchedule.shift_type);
    expect(schedule.status).toBe(newSchedule.status);
  });

  test('查詢排班', async () => {
    const newSchedule = { ...testData.schedules[1], volunteer_id: volunteerId };
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, location, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        newSchedule.volunteer_id,
        newSchedule.start_time,
        newSchedule.end_time,
        newSchedule.shift_type,
        newSchedule.location,
        newSchedule.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    const schedule = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM schedules WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(schedule).toBeDefined();
    expect(schedule.location).toBe(newSchedule.location);
    expect(schedule.shift_type).toBe(newSchedule.shift_type);
  });

  test('更新排班', async () => {
    const newSchedule = { ...testData.schedules[0], volunteer_id: volunteerId };
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, location, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        newSchedule.volunteer_id,
        newSchedule.start_time,
        newSchedule.end_time,
        newSchedule.shift_type,
        newSchedule.location,
        newSchedule.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 更新排班
    const updatedLocation = '新的排班地點';
    await new Promise((resolve, reject) => {
      testDb.run(`
        UPDATE schedules 
        SET location = ?, status = ?
        WHERE id = ?
      `, [updatedLocation, 'confirmed', insertResult], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 驗證更新結果
    const updatedSchedule = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM schedules WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(updatedSchedule.location).toBe(updatedLocation);
    expect(updatedSchedule.status).toBe('confirmed');
  });

  test('排班時間衝突檢查', async () => {
    const baseTime = new Date();
    const startTime = new Date(baseTime.getTime() + 8 * 60 * 60 * 1000); // 8:00
    const endTime = new Date(baseTime.getTime() + 12 * 60 * 60 * 1000);   // 12:00

    // 新增第一個排班
    const firstScheduleId = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, status)
        VALUES (?, ?, ?, ?, ?)
      `, [
        volunteerId,
        startTime.toISOString(),
        endTime.toISOString(),
        'morning',
        'scheduled'
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 測試時間衝突 - 檢查是否有衝突
    const hasConflict = await new Promise((resolve, reject) => {
      testDb.get(`
        SELECT id FROM schedules 
        WHERE volunteer_id = ? 
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
        AND id != ?
      `, [
        volunteerId,
        new Date(baseTime.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 10:00
        new Date(baseTime.getTime() + 11 * 60 * 60 * 1000).toISOString(), // 11:00
        new Date(baseTime.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 10:00
        new Date(baseTime.getTime() + 11 * 60 * 60 * 1000).toISOString(), // 11:00
        new Date(baseTime.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 10:00
        new Date(baseTime.getTime() + 11 * 60 * 60 * 1000).toISOString(), // 11:00
        firstScheduleId
      ], (err, row) => {
        if (err) reject(err);
        else resolve(row !== undefined);
      });
    });

    expect(hasConflict).toBe(true);
  });

  test('刪除排班', async () => {
    const newSchedule = { ...testData.schedules[1], volunteer_id: volunteerId };
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, location, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        newSchedule.volunteer_id,
        newSchedule.start_time,
        newSchedule.end_time,
        newSchedule.shift_type,
        newSchedule.location,
        newSchedule.status
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 刪除排班
    await new Promise((resolve, reject) => {
      testDb.run('DELETE FROM schedules WHERE id = ?', [insertResult], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 驗證是否已刪除
    const deletedSchedule = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM schedules WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(deletedSchedule).toBeUndefined();
  });
});
