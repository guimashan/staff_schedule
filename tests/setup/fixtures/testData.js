// tests/fixtures/testData.js
const testData = {
  volunteers: [
    {
      name: '測試志工1',
      phone: '0912345678',
      email: 'test1@example.com',
      department: '接待服務',
      skills: '接待服務,導覽解說',
      experience_years: 2,
      status: 'active'
    },
    {
      name: '測試志工2',
      phone: '0923456789',
      email: 'test2@example.com',
      department: '導覽解說',
      skills: '導覽解說,外語翻譯',
      experience_years: 3,
      status: 'active'
    }
  ],
  
  schedules: [
    {
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      shift_type: 'morning',
      location: '入口處',
      status: 'scheduled'
    },
    {
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
      shift_type: 'afternoon',
      location: '展示區',
      status: 'confirmed'
    }
  ],

  notifications: [
    {
      title: '系統通知測試',
      content: '這是一則測試通知',
      type: 'system',
      priority: 'normal'
    },
    {
      title: '排班提醒',
      content: '您明天有排班',
      type: 'schedule',
      priority: 'high'
    }
  ]
};

module.exports = testData;
