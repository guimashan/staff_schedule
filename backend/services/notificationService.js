// backend/services/notificationService.js
const db = require('../config/database');

class NotificationService {
  // 發送通知
  static async sendNotification(notificationData) {
    try {
      const { title, content, type, priority, is_broadcast, recipient_ids, scheduled_time, sender_id } = notificationData;
      
      const result = await db.run(`
        INSERT INTO notifications (title, content, type, priority, is_broadcast, recipient_ids, scheduled_time, sender_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [title, content, type, priority, is_broadcast ? 1 : 0, JSON.stringify(recipient_ids || []), scheduled_time, sender_id]);
      
      return result.lastID;
    } catch (error) {
      console.error('發送通知失敗:', error);
      throw error;
    }
  }

  // 發送排班提醒通知
  static async sendScheduleReminder(scheduleId) {
    try {
      const schedule = await db.get(`
        SELECT s.*, v.name as volunteer_name, v.email as volunteer_email
        FROM schedules s
        LEFT JOIN volunteers v ON s.volunteer_id = v.id
        WHERE s.id = ?
      `, [scheduleId]);

      if (!schedule) {
        throw new Error('排班不存在');
      }

      const title = `排班提醒：${schedule.volunteer_name}`;
      const content = `您在 ${new Date(schedule.start_time).toLocaleString('zh-TW')} 有排班，地點：${schedule.location || '未指定'}`;
      
      await this.sendNotification({
        title,
        content,
        type: 'schedule',
        priority: 'high',
        is_broadcast: false,
        recipient_ids: [schedule.volunteer_id],
        sender_id: 1 // 系統發送
      });
    } catch (error) {
      console.error('發送排班提醒失敗:', error);
      throw error;
    }
  }

  // 檢查是否有即將到來的排班並發送提醒
  static async checkAndSendReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 30 * 60000); // 30分鐘後
      
      const schedules = await db.all(`
        SELECT * FROM schedules 
        WHERE start_time BETWEEN ? AND ? 
        AND status = 'confirmed'
      `, [now.toISOString(), reminderTime.toISOString()]);

      for (const schedule of schedules) {
        await this.sendScheduleReminder(schedule.id);
      }
    } catch (error) {
      console.error('檢查排班提醒失敗:', error);
    }
  }
}

module.exports = NotificationService;
