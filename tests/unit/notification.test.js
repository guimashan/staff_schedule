// tests/unit/notification.test.js
const { testDb } = require('../setup/testSetup');
const testData = require('../fixtures/testData');

describe('通知管理單元測試', () => {
  let notificationId;

  beforeEach(async () => {
    // 清空測試資料
    await new Promise((resolve) => {
      testDb.run('DELETE FROM notifications', resolve);
    });
  });

  test('新增通知', async () => {
    const newNotification = testData.notifications[0];
    
    notificationId = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO notifications (title, content, type, priority)
        VALUES (?, ?, ?, ?)
      `, [
        newNotification.title,
        newNotification.content,
        newNotification.type,
        newNotification.priority
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    expect(notificationId).toBeGreaterThan(0);

    // 驗證資料是否正確插入
    const notification = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM notifications WHERE id = ?', [notificationId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(notification.title).toBe(newNotification.title);
    expect(notification.content).toBe(newNotification.content);
    expect(notification.type).toBe(newNotification.type);
    expect(notification.priority).toBe(newNotification.priority);
    expect(notification.is_read).toBe(0); // 預設未讀
  });

  test('標記通知為已讀', async () => {
    const newNotification = testData.notifications[1];
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO notifications (title, content, type, priority)
        VALUES (?, ?, ?, ?)
      `, [
        newNotification.title,
        newNotification.content,
        newNotification.type,
        newNotification.priority
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 標記為已讀
    await new Promise((resolve, reject) => {
      testDb.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [insertResult], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 驗證是否已標記為已讀
    const updatedNotification = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM notifications WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(updatedNotification.is_read).toBe(1);
  });

  test('通知類型統計', async () => {
    // 新增多筆不同類型的通知
    const notifications = [
      { title: '系統通知1', content: '內容1', type: 'system' },
      { title: '系統通知2', content: '內容2', type: 'system' },
      { title: '排班通知', content: '內容3', type: 'schedule' },
      { title: '警示通知', content: '內容4', type: 'alert' }
    ];

    for (const notification of notifications) {
      await new Promise((resolve, reject) => {
        testDb.run(`
          INSERT INTO notifications (title, content, type)
          VALUES (?, ?, ?)
        `, [notification.title, notification.content, notification.type], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 統計各類型通知數量
    const typeStats = await new Promise((resolve, reject) => {
      testDb.all(`
        SELECT type, COUNT(*) as count
        FROM notifications
        GROUP BY type
        ORDER BY count DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    expect(typeStats.length).toBeGreaterThan(0);
    expect(typeStats.some(stat => stat.type === 'system' && stat.count === 2)).toBe(true);
  });

  test('刪除通知', async () => {
    const newNotification = testData.notifications[0];
    const insertResult = await new Promise((resolve, reject) => {
      testDb.run(`
        INSERT INTO notifications (title, content, type, priority)
        VALUES (?, ?, ?, ?)
      `, [
        newNotification.title,
        newNotification.content,
        newNotification.type,
        newNotification.priority
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // 刪除通知
    await new Promise((resolve, reject) => {
      testDb.run('DELETE FROM notifications WHERE id = ?', [insertResult], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 驗證是否已刪除
    const deletedNotification = await new Promise((resolve, reject) => {
      testDb.get('SELECT * FROM notifications WHERE id = ?', [insertResult], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(deletedNotification).toBeUndefined();
  });

  test('未讀通知查詢', async () => {
    // 新增多筆通知，部分已讀部分未讀
    const notifications = [
      { title: '未讀通知1', content: '內容1', type: 'info', is_read: 0 },
      { title: '未讀通知2', content: '內容2', type: 'info', is_read: 0 },
      { title: '已讀通知', content: '內容3', type: 'info', is_read: 1 }
    ];

    for (const notification of notifications) {
      await new Promise((resolve, reject) => {
        testDb.run(`
          INSERT INTO notifications (title, content, type, is_read)
          VALUES (?, ?, ?, ?)
        `, [notification.title, notification.content, notification.type, notification.is_read], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 查詢未讀通知
    const unreadNotifications = await new Promise((resolve, reject) => {
      testDb.all('SELECT * FROM notifications WHERE is_read = 0', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    expect(unreadNotifications.length).toBe(2);
    expect(unreadNotifications.every(n => n.is_read === 0)).toBe(true);
  });
});
