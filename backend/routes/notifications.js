// backend/routes/notifications.js
const express = require('express');
const router = express.Router();

// 獲取通知列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, is_read } = req.query;
    let query = `
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }

    if (is_read !== undefined) {
      query += ' AND n.is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ' ORDER BY n.created_at DESC';
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const notifications = await db.all(query, params);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取未讀通知
router.get('/unread', async (req, res) => {
  try {
    const notifications = await db.all(`
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.is_read = 0
      ORDER BY n.created_at DESC
      LIMIT 10
    `);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取單一通知
router.get('/:id', async (req, res) => {
  try {
    const notification = await db.get(`
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.id = ?
    `, [req.params.id]);
    
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 新增通知
router.post('/', async (req, res) => {
  try {
    const { title, content, type, priority, is_broadcast, recipient_ids, scheduled_time, sender_id } = req.body;
    
    // 驗證必填欄位
    if (!title || !content) {
      return res.status(400).json({ message: '請填寫標題和內容' });
    }

    const result = await db.run(`
      INSERT INTO notifications (title, content, type, priority, is_broadcast, recipient_ids, scheduled_time, sender_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [title, content, type || 'info', priority || 'normal', is_broadcast ? 1 : 0, recipient_ids ? JSON.stringify(recipient_ids) : '[]', scheduled_time, sender_id || 1]);

    const notification = await db.get(`
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.id = ?
    `, [result.lastID]);
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新通知
router.put('/:id', async (req, res) => {
  try {
    const { title, content, type, priority, is_broadcast, recipient_ids, scheduled_time } = req.body;
    
    const result = await db.run(`
      UPDATE notifications 
      SET title = ?, content = ?, type = ?, priority = ?, is_broadcast = ?, 
          recipient_ids = ?, scheduled_time = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [title, content, type, priority, is_broadcast ? 1 : 0, recipient_ids ? JSON.stringify(recipient_ids) : '[]', scheduled_time, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }

    const notification = await db.get(`
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.id = ?
    `, [req.params.id]);
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 刪除通知
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json({ message: '通知已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 標記為已讀
router.put('/:id/read', async (req, res) => {
  try {
    const result = await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json({ message: '已標記為已讀' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 標記全部為已讀
router.put('/mark-all-read', async (req, res) => {
  try {
    const result = await db.run('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    res.json({ message: `標記 ${result.changes} 筆通知為已讀` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取通知統計
router.get('/stats', async (req, res) => {
  try {
    const [total, unread, read] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM notifications').then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM notifications WHERE is_read = 1').then(row => row.count)
    ]);

    const byType = await db.all(`
      SELECT type, COUNT(*) as count
      FROM notifications
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json({
      total,
      unread,
      read,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
