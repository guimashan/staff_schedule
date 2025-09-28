// backend/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

// 創建SQLite資料庫
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// 創建資料表
db.serialize(() => {
  // 志工表
  db.run(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT,
      skills TEXT,
      experience_years INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 排班表
  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteer_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      shift_type TEXT NOT NULL DEFAULT 'morning',
      location TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers (id)
    )
  `);
});

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API路由
// 獲取志工列表
app.get('/api/volunteers', (req, res) => {
  db.all('SELECT * FROM volunteers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 新增志工
app.post('/api/volunteers', (req, res) => {
  const { name, phone, email, department, skills, experience_years } = req.body;
  
  if (!name || !phone || !email) {
    res.status(400).json({ error: '姓名、電話和電子郵件是必填的' });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO volunteers (name, phone, email, department, skills, experience_years)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run([name, phone, email, department, skills, experience_years], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, phone, email, department, skills, experience_years });
  });
  
  stmt.finalize();
});

// 獲取排班列表
app.get('/api/schedules', (req, res) => {
  db.all(`
    SELECT s.*, v.name as volunteer_name 
    FROM schedules s
    LEFT JOIN volunteers v ON s.volunteer_id = v.id
    ORDER BY s.start_time DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 新增排班
app.post('/api/schedules', (req, res) => {
  const { volunteer_id, start_time, end_time, shift_type, location } = req.body;
  
  if (!volunteer_id || !start_time || !end_time) {
    res.status(400).json({ error: '志工ID、開始時間和結束時間是必填的' });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO schedules (volunteer_id, start_time, end_time, shift_type, location)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run([volunteer_id, start_time, end_time, shift_type, location], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, volunteer_id, start_time, end_time, shift_type, location });
  });
  
  stmt.finalize();
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// React Router支援
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
  console.log(`📋 志工API: http://localhost:${PORT}/api/volunteers`);
  console.log(`📅 排班API: http://localhost:${PORT}/api/schedules`);
});

module.exports = app;
