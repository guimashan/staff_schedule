// backend/routes/schedules.js
const express = require('express');
const router = express.Router();

// 獲取排班列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, shift_type } = req.query;
    let query = `
      SELECT s.*, v.name as volunteer_name, v.department as volunteer_department
      FROM schedules s
      LEFT JOIN volunteers v ON s.volunteer_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (shift_type) {
      query += ' AND s.shift_type = ?';
      params.push(shift_type);
    }

    query += ' ORDER BY s.start_time DESC';
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const schedules = await db.all(query, params);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取單一排班
router.get('/:id', async (req, res) => {
  try {
    const schedule = await db.get(`
      SELECT s.*, v.name as volunteer_name, v.department as volunteer_department
      FROM schedules s
      LEFT JOIN volunteers v ON s.volunteer_id = v.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (!schedule) {
      return res.status(404).json({ message: '排班不存在' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 新增排班
router.post('/', async (req, res) => {
  try {
    const { volunteer_id, start_time, end_time, shift_type, location, notes, status } = req.body;
    
    // 驗證必填欄位
    if (!volunteer_id || !start_time || !end_time) {
      return res.status(400).json({ message: '請填寫所有必填欄位' });
    }

    // 檢查時間衝突
    const existingSchedule = await db.get(`
      SELECT id FROM schedules 
      WHERE volunteer_id = ? 
      AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?) OR
        (start_time >= ? AND end_time <= ?)
      )
      AND status != 'cancelled'
    `, [volunteer_id, end_time, start_time, end_time, start_time, start_time, end_time]);

    if (existingSchedule) {
      return res.status(400).json({ message: '志工時間衝突，無法排班' });
    }

    const result = await db.run(`
      INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, location, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [volunteer_id, start_time, end_time, shift_type, location, notes, status || 'scheduled']);

    const schedule = await db.get(`
      SELECT s.*, v.name as volunteer_name, v.department as volunteer_department
      FROM schedules s
      LEFT JOIN volunteers v ON s.volunteer_id = v.id
      WHERE s.id = ?
    `, [result.lastID]);
    
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新排班
router.put('/:id', async (req, res) => {
  try {
    const { volunteer_id, start_time, end_time, shift_type, location, notes, status } = req.body;
    
    // 檢查時間衝突
    if (volunteer_id && start_time && end_time) {
      const existingSchedule = await db.get(`
        SELECT id FROM schedules 
        WHERE volunteer_id = ? AND id != ?
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
        AND status != 'cancelled'
      `, [volunteer_id, req.params.id, end_time, start_time, end_time, start_time, start_time, end_time]);

      if (existingSchedule) {
        return res.status(400).json({ message: '志工時間衝突，無法排班' });
      }
    }

    const result = await db.run(`
      UPDATE schedules 
      SET volunteer_id = ?, start_time = ?, end_time = ?, shift_type = ?, 
          location = ?, notes = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [volunteer_id, start_time, end_time, shift_type, location, notes, status, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: '排班不存在' });
    }

    const schedule = await db.get(`
      SELECT s.*, v.name as volunteer_name, v.department as volunteer_department
      FROM schedules s
      LEFT JOIN volunteers v ON s.volunteer_id = v.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 刪除排班
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '排班不存在' });
    }

    res.json({ message: '排班已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取排班統計
router.get('/stats', async (req, res) => {
  try {
    const [total, scheduled, confirmed, cancelled] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM schedules').then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM schedules WHERE status = ?', ['scheduled']).then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM schedules WHERE status = ?', ['confirmed']).then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM schedules WHERE status = ?', ['cancelled']).then(row => row.count)
    ]);

    const byShiftType = await db.all(`
      SELECT shift_type, COUNT(*) as count
      FROM schedules
      GROUP BY shift_type
      ORDER BY count DESC
    `);

    const byVolunteer = await db.all(`
      SELECT v.name as volunteer_name, v.department, COUNT(s.id) as count
      FROM volunteers v
      LEFT JOIN schedules s ON v.id = s.volunteer_id
      GROUP BY v.id
      HAVING count > 0
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      total,
      scheduled,
      confirmed,
      cancelled,
      byShiftType,
      byVolunteer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取月度排班
router.get('/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: '請提供年份和月份' });
    }

    const schedules = await db.all(`
      SELECT s.*, v.name as volunteer_name, v.department as volunteer_department
      FROM schedules s
      LEFT JOIN volunteers v ON s.volunteer_id = v.id
      WHERE strftime('%Y', start_time) = ? AND strftime('%m', start_time) = ?
      ORDER BY start_time
    `, [year, month]);

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
