-- backend/migrations/003_schedules_table.sql
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
);

-- 建立索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_schedules_volunteer_id ON schedules (volunteer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules (start_time);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules (status);
CREATE INDEX IF NOT EXISTS idx_schedules_shift_type ON schedules (shift_type);
