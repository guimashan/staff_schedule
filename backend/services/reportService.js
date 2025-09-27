// backend/services/reportService.js
const db = require('../config/database');

class ReportService {
  // 生成排班報告
  static async generateScheduleReport(filters = {}) {
    try {
      let query = `
        SELECT s.*, v.name as volunteer_name, v.department as volunteer_department
        FROM schedules s
        LEFT JOIN volunteers v ON s.volunteer_id = v.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += ' AND s.status = ?';
        params.push(filters.status);
      }

      if (filters.shift_type) {
        query += ' AND s.shift_type = ?';
        params.push(filters.shift_type);
      }

      if (filters.date_from) {
        query += ' AND s.start_time >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ' AND s.start_time <= ?';
        params.push(filters.date_to);
      }

      query += ' ORDER BY s.start_time DESC';

      const schedules = await db.all(query, params);
      return schedules;
    } catch (error) {
      console.error('生成排班報告失敗:', error);
      throw error;
    }
  }

  // 生成出勤報告
  static async generateAttendanceReport(filters = {}) {
    try {
      let query = `
        SELECT a.*, v.name as volunteer_name
        FROM attendance a
        LEFT JOIN volunteers v ON a.volunteer_id = v.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.date_from) {
        query += ' AND a.date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ' AND a.date <= ?';
        params.push(filters.date_to);
      }

      if (filters.volunteer_id) {
        query += ' AND a.volunteer_id = ?';
        params.push(filters.volunteer_id);
      }

      if (filters.status) {
        query += ' AND a.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY a.date DESC';

      const attendance = await db.all(query, params);
      return attendance;
    } catch (error) {
      console.error('生成出勤報告失敗:', error);
      throw error;
    }
  }

  // 獲取統計數據
  static async getStatistics() {
    try {
      const [totalVolunteers, activeVolunteers, totalSchedules, confirmedSchedules] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM volunteers').then(row => row.count),
        db.get('SELECT COUNT(*) as count FROM volunteers WHERE status = ?', ['active']).then(row => row.count),
        db.get('SELECT COUNT(*) as count FROM schedules').then(row => row.count),
        db.get('SELECT COUNT(*) as count FROM schedules WHERE status = ?', ['confirmed']).then(row => row.count)
      ]);

      return {
        totalVolunteers,
        activeVolunteers,
        totalSchedules,
        confirmedSchedules
      };
    } catch (error) {
      console.error('獲取統計數據失敗:', error);
      throw error;
    }
  }
}

module.exports = ReportService;
