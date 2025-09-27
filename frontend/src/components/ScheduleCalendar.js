import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { scheduleService } from '../services/api';

const ScheduleCalendar = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [shift, setShift] = useState('1'); // 1=全天, 2=早班, 3=午班

  // 獲取當月排班資料
  useEffect(() => {
    loadCurrentMonthSchedule();
  }, []);

  const loadCurrentMonthSchedule = async () => {
    setLoading(true);
    setError('');
    
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      
      // 這裡會根據用戶角色獲取不同的排班資料
      let scheduleData = [];
      
      if (user.role === 'admin') {
        // 管理者可以看到所有組別的排班
        scheduleData = await loadAllSchedules(year, month);
      } else if (user.role === 'power_user') {
        // 組長可以看到自己組別的排班
        scheduleData = await loadGroupSchedules(user.group_id, year, month);
      } else {
        // 組員可以看到自己的排班
        scheduleData = await loadUserSchedules(user.id, year, month);
      }
      
      setEvents(scheduleData);
    } catch (error) {
      setError('載入排班資料失敗');
      console.error('載入排班資料錯誤：', error);
    } finally {
      setLoading(false);
    }
  };

  // 模擬載入所有排班資料
  const loadAllSchedules = async (year, month) => {
    // 這裡會呼叫實際的 API
    return [
      {
        id: '1',
        title: '神務組 - 張三',
        date: `${year}-${String(month).padStart(2, '0')}-05`,
        backgroundColor: '#e74c3c',
        borderColor: '#c0392b'
      },
      {
        id: '2',
        title: '活動組 - 李四',
        date: `${year}-${String(month).padStart(2, '0')}-10`,
        backgroundColor: '#3498db',
        borderColor: '#2980b9'
      },
      {
        id: '3',
        title: '誦經組 - 王五',
        date: `${year}-${String(month).padStart(2, '0')}-15`,
        backgroundColor: '#2ecc71',
        borderColor: '#27ae60'
      }
    ];
  };

  // 模擬載入組別排班資料
  const loadGroupSchedules = async (groupId, year, month) => {
    return [
      {
        id: '4',
        title: '組員A - 全天',
        date: `${year}-${String(month).padStart(2, '0')}-08`,
        backgroundColor: '#f39c12',
        borderColor: '#d35400'
      },
      {
        id: '5',
        title: '組員B - 早班',
        date: `${year}-${String(month).padStart(2, '0')}-12`,
        backgroundColor: '#f39c12',
        borderColor: '#d35400'
      }
    ];
  };

  // 模擬載入用戶排班資料
  const loadUserSchedules = async (userId, year, month) => {
    return [
      {
        id: '6',
        title: '您的排班 - 全天',
        date: `${year}-${String(month).padStart(2, '0')}-03`,
        backgroundColor: '#9b59b6',
        borderColor: '#8e44ad'
      }
    ];
  };

  // 處理日期點擊
  const handleDateClick = (selectInfo) => {
    if (user.role === 'user' && canApplyForSchedule()) {
      setSelectedDate(selectInfo.dateStr);
      setShowModal(true);
    }
  };

  // 檢查是否可以申請排班
  const canApplyForSchedule = () => {
    const today = new Date();
    const day = today.getDate();
    return day >= 15 && day <= 20; // 每月15-20號可以申請
  };

  // 處理排班申請
  const handleScheduleRequest = async (e) => {
    e.preventDefault();
    
    try {
      const requestData = {
        date: selectedDate,
        shift_id: parseInt(shift),
        user_id: user.id,
        group_id: user.group_id
      };
      
      // 這裡會呼叫實際的 API
      // await scheduleService.requestSchedule(requestData);
      
      // 更新行事曆顯示
      const newEvent = {
        id: Date.now().toString(),
        title: getShiftName(shift) + ' (申請中)',
        date: selectedDate,
        backgroundColor: '#95a5a6',
        borderColor: '#7f8c8d'
      };
      
      setEvents([...events, newEvent]);
      setShowModal(false);
      
      alert('排班申請已送出！');
    } catch (error) {
      alert('申請失敗，請稍後再試');
    }
  };

  // 獲取班別名稱
  const getShiftName = (shiftId) => {
    switch(shiftId) {
      case '1': return '全天';
      case '2': return '早班';
      case '3': return '午班';
      default: return '未知';
    }
  };

  // 處理事件點擊
  const handleEventClick = (clickInfo) => {
    if (user.role === 'power_user' || user.role === 'admin') {
      // 組長和管理者可以管理排班
      alert(`排班詳情：${clickInfo.event.title}\n日期：${clickInfo.event.start}`);
    } else {
      // 組員只能查看
      alert(`您的排班：${clickInfo.event.title}\n日期：${clickInfo.event.start}`);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div>載入排班資料中...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4>本月排班表</h4>
            <div>
              {user.role === 'user' && (
                <small className={canApplyForSchedule() ? 'text-success' : 'text-muted'}>
                  {canApplyForSchedule() ? '✅ 現在可以申請排班' : '⏰ 申請時間：每月15-20號'}
                </small>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            locale="zh-tw"
            firstDay={0}
            buttonText={{
              today: '今天',
              month: '月',
              week: '週',
              day: '日'
            }}
          />
        </Card.Body>
      </Card>

      {/* 排班申請模態框 */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>申請排班</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleScheduleRequest}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>日期</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedDate} 
                readOnly 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>班別</Form.Label>
              <Form.Select 
                value={shift} 
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="1">全天 (8:00-17:00)</option>
                <option value="2">早班 (8:00-12:00)</option>
                <option value="3">午班 (13:00-17:00)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button variant="primary" type="submit">
              送出申請
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ScheduleCalendar;
