// backend/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// 創建表
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
      emergency_contact TEXT,
      emergency_phone TEXT,
      address TEXT,
      birth_date DATE,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers (id)
    )
  `);

  // 通知表
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      priority TEXT DEFAULT 'normal',
      is_broadcast BOOLEAN DEFAULT 0,
      recipient_ids TEXT DEFAULT '[]',
      scheduled_time DATETIME,
      sender_id INTEGER,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 建立索引
  db.run('CREATE INDEX IF NOT EXISTS idx_schedules_volunteer_id ON schedules (volunteer_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules (start_time)');
  db.run('CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules (status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_schedules_shift_type ON schedules (shift_type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications (sender_id)');
});

module.exports = db;
