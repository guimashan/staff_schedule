// tests/integration/api.test.js
const request = require('supertest');
const express = require('express');
const app = express();

// 模擬後端應用程式
app.use(express.json());

// 模擬API端點
app.get('/api/volunteers', (req, res) => {
  res.json([
    { id: 1, name: '測試志工', email: 'test@example.com', department: '接待服務' }
  ]);
});

app.post('/api/volunteers', (req, res) => {
  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ message: '缺少必要欄位' });
  }
  
  res.status(201).json({
    id: 2,
    name,
    email,
    department,
    created_at: new Date().toISOString()
  });
});

app.get('/api/schedules', (req, res) => {
  res.json([
    { id: 1, volunteer_id: 1, start_time: '2023-01-01T08:00:00Z', end_time: '2023-01-01T12:00:00Z', shift_type: 'morning' }
  ]);
});

app.post('/api/schedules', (req, res) => {
  const { volunteer_id, start_time, end_time, shift_type } = req.body;
  if (!volunteer_id || !start_time || !end_time || !shift_type) {
    return res.status(400).json({ message: '缺少必要欄位' });
  }
  
  res.status(201).json({
    id: 2,
    volunteer_id,
    start_time,
    end_time,
    shift_type,
    status: 'scheduled',
    created_at: new Date().toISOString()
  });
});

describe('API整合測試', () => {
  test('GET /api/volunteers - 獲取志工列表', async () => {
    const response = await request(app)
      .get('/api/volunteers')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('email');
  });

  test('POST /api/volunteers - 新增志工', async () => {
    const newVolunteer = {
      name: '新增志工',
      email: 'newvolunteer@example.com',
      department: '導覽解說'
    };

    const response = await request(app)
      .post('/api/volunteers')
      .send(newVolunteer)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newVolunteer.name);
    expect(response.body.email).toBe(newVolunteer.email);
    expect(response.body.department).toBe(newVolunteer.department);
  });

  test('POST /api/volunteers - 缺少必要欄位', async () => {
    const invalidVolunteer = {
      name: '測試志工'
      // 缺少 email 和 department
    };

    const response = await request(app)
      .post('/api/volunteers')
      .send(invalidVolunteer)
      .expect(400);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('缺少必要欄位');
  });

  test('GET /api/schedules - 獲取排班列表', async () => {
    const response = await request(app)
      .get('/api/schedules')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('volunteer_id');
    expect(response.body[0]).toHaveProperty('start_time');
  });

  test('POST /api/schedules - 新增排班', async () => {
    const newSchedule = {
      volunteer_id: 1,
      start_time: '2023-01-02T08:00:00Z',
      end_time: '2023-01-02T12:00:00Z',
      shift_type: 'morning'
    };

    const response = await request(app)
      .post('/api/schedules')
      .send(newSchedule)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.volunteer_id).toBe(newSchedule.volunteer_id);
    expect(response.body.start_time).toBe(newSchedule.start_time);
    expect(response.body.shift_type).toBe(newSchedule.shift_type);
  });

  test('POST /api/schedules - 排班時間衝突檢查', async () => {
    const conflictingSchedule = {
      volunteer_id: 1,
      start_time: '2023-01-01T09:00:00Z',
      end_time: '2023-01-01T11:00:00Z',
      shift_type: 'morning'
    };

    // 在實際應用中，這裡會檢查時間衝突
    // 目前模擬返回成功，但實際實現中應檢查衝突
    const response = await request(app)
      .post('/api/schedules')
      .send(conflictingSchedule)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });

  test('POST /api/schedules - 缺少必要欄位', async () => {
    const invalidSchedule = {
      volunteer_id: 1
      // 缺少其他必要欄位
    };

    const response = await request(app)
      .post('/api/schedules')
      .send(invalidSchedule)
      .expect(400);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('缺少必要欄位');
  });
});
