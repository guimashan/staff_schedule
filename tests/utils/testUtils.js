// tests/utils/testUtils.js
const testData = require('../fixtures/testData');

class TestUtils {
  // 生成測試志工資料
  static generateVolunteerData(overrides = {}) {
    const baseVolunteer = testData.volunteers[0];
    return {
      ...baseVolunteer,
      ...overrides,
      email: overrides.email || `test${Date.now()}@example.com`
    };
  }

  // 生成測試排班資料
  static generateScheduleData(volunteerId, overrides = {}) {
    const baseSchedule = testData.schedules[0];
    return {
      volunteer_id: volunteerId,
      ...baseSchedule,
      ...overrides
    };
  }

  // 生成測試通知資料
  static generateNotificationData(overrides = {}) {
    const baseNotification = testData.notifications[0];
    return {
      ...baseNotification,
      ...overrides
    };
  }

  // 等待一段時間
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 驗證日期格式
  static isValidDate(dateString) {
    return !isNaN(Date.parse(dateString));
  }

  // 驗證電子郵件格式
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 驗證手機號碼格式
  static isValidPhone(phone) {
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phone);
  }

  // 深度比較物件
  static deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}

module.exports = TestUtils;
