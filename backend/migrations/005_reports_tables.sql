-- backend/migrations/005_reports_tables.sql
-- 創建出勤記錄表
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volunteer_id INTEGER NOT NULL,
  date DATE NOT NULL,
  shift_type TEXT,
  status TEXT NOT NULL DEFAULT 'present',
  arrival_time TIME,
  departure_time TIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers (id)
);

-- 建立出勤記錄索引
CREATE INDEX IF NOT EXISTS idx_attendance_volunteer_id ON attendance (volunteer_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance (status);
CREATE INDEX IF NOT EXISTS idx_attendance_shift_type ON attendance (shift_type);

-- 創建報告生成記錄表
CREATE TABLE IF NOT EXISTS report_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_type TEXT NOT NULL,
  generated_by INTEGER,
  filters TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 建立報告記錄索引
CREATE INDEX IF NOT EXISTS idx_report_logs_report_type ON report_logs (report_type);
CREATE INDEX IF NOT EXISTS idx_report_logs_generated_at ON report_logs (created_at);
