// backend/routes/volunteers.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 設定上傳配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 獲取志工列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let query = 'SELECT * FROM volunteers WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR department LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const volunteers = await db.all(query, params);
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取單一志工
router.get('/:id', async (req, res) => {
  try {
    const volunteer = await db.get('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    if (!volunteer) {
      return res.status(404).json({ message: '志工不存在' });
    }
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 新增志工
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, department, skills, experience_years, emergency_contact, emergency_phone, address, birth_date, status, notes } = req.body;
    
    // 驗證必填欄位
    if (!name || !phone || !email || !department) {
      return res.status(400).json({ message: '請填寫所有必填欄位' });
    }

    const result = await db.run(`
      INSERT INTO volunteers (name, phone, email, department, skills, experience_years, emergency_contact, emergency_phone, address, birth_date, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [name, phone, email, department, skills, experience_years, emergency_contact, emergency_phone, address, birth_date, status, notes]);

    const volunteer = await db.get('SELECT * FROM volunteers WHERE id = ?', [result.lastID]);
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新志工
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, department, skills, experience_years, emergency_contact, emergency_phone, address, birth_date, status, notes } = req.body;
    
    const result = await db.run(`
      UPDATE volunteers 
      SET name = ?, phone = ?, email = ?, department = ?, skills = ?, experience_years = ?, 
          emergency_contact = ?, emergency_phone = ?, address = ?, birth_date = ?, 
          status = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [name, phone, email, department, skills, experience_years, emergency_contact, emergency_phone, address, birth_date, status, notes, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: '志工不存在' });
    }

    const volunteer = await db.get('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 刪除志工
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM volunteers WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: '志工不存在' });
    }

    res.json({ message: '志工已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 獲取志工統計
router.get('/stats', async (req, res) => {
  try {
    const [total, active, inactive, pending] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM volunteers').then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM volunteers WHERE status = ?', ['active']).then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM volunteers WHERE status = ?', ['inactive']).then(row => row.count),
      db.get('SELECT COUNT(*) as count FROM volunteers WHERE status = ?', ['pending']).then(row => row.count)
    ]);

    const byDepartment = await db.all(`
      SELECT department, COUNT(*) as count 
      FROM volunteers 
      GROUP BY department
      ORDER BY count DESC
    `);

    const bySkill = await db.all(`
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

    const byExperience = await db.all(`
      SELECT experience_years, COUNT(*) as count
      FROM volunteers
      GROUP BY experience_years
      ORDER BY experience_years ASC
    `);

    res.json({
      total,
      active,
      inactive,
      pending,
      byDepartment,
      bySkill,
      byExperience
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 批量導入志工資料
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '請選擇要上傳的檔案' });
    }

    const fs = require('fs');
    const csv = require('csv-parser');
    const results = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    let imported = 0;
    for (const row of results) {
      try {
        await db.run(`
          INSERT INTO volunteers (name, phone, email, department, skills, experience_years, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          row.name,
          row.phone,
          row.email,
          row.department,
          row.skills,
          parseInt(row.experience_years) || 0,
          row.status || 'pending'
        ]);
        imported++;
      } catch (error) {
        console.error('插入資料錯誤:', error);
        // 繼續處理下一行
      }
    }

    // 刪除上傳的檔案
    fs.unlinkSync(req.file.path);

    res.json({ 
      message: '導入完成', 
      imported,
      total: results.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
