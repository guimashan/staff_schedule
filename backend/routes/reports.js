// backend/routes/reports.js
const express = require('express');
const router = express.Router();

// 獲取報告總覽
router.get('/dashboard', async (req, res) => {
  try {
    const [totalVolunteers, activeVolunteers, totalSchedules, confirmedSchedules] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM volunteers').then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM volunteers WHERE status = ?', ['active']).then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM schedules').then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM schedules WHERE status = ?', ['confirmed']).then(row => row.count)
    ]);

    // 部門分布
    const volunteerByDepartment = await db.all(`
      SELECT department, COUNT(*) as count 
      FROM volunteers 
      GROUP BY department
      ORDER BY count DESC
    `);

    // 月度排班趨勢
    const scheduleByMonth = await db.all(`
      SELECT strftime('%Y-%m', start_time) as month, COUNT(*) as count
      FROM schedules
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    // 出勤率趨勢
    const attendanceTrend = await db.all(`
      SELECT strftime('%Y-%m', date) as date, 
             CAST(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) as rate
      FROM attendance
      GROUP BY date
      ORDER BY date DESC
      LIMIT 6
    `);

    res.json({
      totalVolunteers,
      activeVolunteers,
      totalSchedules,
      confirmedSchedules,
      volunteerByDepartment,
      scheduleByMonth,
      attendanceTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取志工報告
router.get('/volunteers', async (req, res) => {
  try {
    const { department, status, skill, search } = req.query;
    
    let query = `
      SELECT * FROM volunteers 
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (skill) {
      query += ' AND skills LIKE ?';
      params.push(`%${skill}%`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR department LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const volunteers = await db.all(query, params);

    // 統計
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM volunteers
      WHERE 1=1
    `);

    // 部門統計
    const departmentStats = await db.all(`
      SELECT department, COUNT(*) as count
      FROM volunteers
      GROUP BY department
      ORDER BY count DESC
    `);

    // 技能統計
    const skillStats = await db.all(`
      SELECT skill, COUNT(*) as count
      FROM (
        SELECT TRIM(value) as skill
        FROM volunteers
        CROSS JOIN json_each('[' || REPLACE(skills, ',', '","') || ']')
        WHERE skills IS NOT NULL AND skills != ''
      )
      GROUP BY skill
      ORDER BY count DESC
    `);

    res.json({
      volunteers,
      stats,
      departmentStats,
      skillStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取排班報告
router.get('/schedules', async (req, res) => {
  try {
    const { status, shift_type, date_from, date_to, search } = req.query;
    
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

    if (date_from) {
      query += ' AND s.start_time >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND s.start_time <= ?';
      params.push(date_to);
    }

    if (search) {
      query += ' AND (v.name LIKE ? OR s.location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY s.start_time DESC';

    const schedules = await db.all(query, params);

    // 統計
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM schedules
      WHERE 1=1
    `);

    // 班別統計
    const shiftStats = await db.all(`
      SELECT shift_type, COUNT(*) as count
      FROM schedules
      GROUP BY shift_type
      ORDER BY count DESC
    `);

    // 志工排班統計
    const volunteerStats = await db.all(`
      SELECT v.name as volunteer_name, COUNT(s.id) as count
      FROM volunteers v
      LEFT JOIN schedules s ON v.id = s.volunteer_id
      GROUP BY v.id
      HAVING count > 0
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      schedules,
      stats,
      shiftStats,
      volunteerStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取出勤報告
router.get('/attendance', async (req, res) => {
  try {
    const { date_from, date_to, volunteer_id, status } = req.query;
    
    let query = `
      SELECT a.*, v.name as volunteer_name
      FROM attendance a
      LEFT JOIN volunteers v ON a.volunteer_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND a.date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND a.date <= ?';
      params.push(date_to);
    }

    if (volunteer_id) {
      query += ' AND a.volunteer_id = ?';
      params.push(volunteer_id);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.date DESC';

    const attendance = await db.all(query, params);

    // 統計
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'early_departure' THEN 1 ELSE 0 END) as early_departure
      FROM attendance
      WHERE 1=1
    `);

    // 月度趨勢
    const monthlyTrend = await db.all(`
      SELECT strftime('%Y-%m', date) as month,
             CAST(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) as attendance_rate
      FROM attendance
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    // 志工出勤率
    const volunteerAttendance = await db.all(`
      SELECT v.name as volunteer_name, v.id as volunteer_id,
             CAST(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) as attendance_rate
      FROM volunteers v
      LEFT JOIN attendance a ON v.id = a.volunteer_id
      GROUP BY v.id
      HAVING COUNT(a.id) > 0
      ORDER BY attendance_rate DESC
      LIMIT 10
    `);

    res.json({
      attendance,
      stats,
      monthlyTrend,
      volunteerAttendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 匯出報告
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    
    // 這裡會根據格式生成相應的報告文件
    // 實際實現中需要安裝相應的庫 (如 exceljs, pdfkit 等)
    
    if (format === 'pdf') {
      // 生成PDF報告
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
      res.send('PDF報告內容');
    } else if (format === 'excel') {
      // 生成Excel報告
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
      res.send('Excel報告內容');
    } else if (format === 'csv') {
      // 生成CSV報告
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
      res.send('CSV報告內容');
    } else {
      res.status(400).json({ message: '不支援的格式' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
