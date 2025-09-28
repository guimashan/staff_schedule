// frontend/src/App.js (靜態版本)
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  Alert,
  Tabs,
  Tab
} from '@mui/material';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [volunteers, setVolunteers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', department: '' });
  const [scheduleForm, setScheduleForm] = useState({ 
    volunteer_id: '', 
    start_time: '', 
    end_time: '', 
    shift_type: 'morning',
    location: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 使用localStorage模擬資料庫
  useEffect(() => {
    const savedVolunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setVolunteers(savedVolunteers);
    setSchedules(savedSchedules);
  }, []);

  const addVolunteer = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      setError('姓名、電話和電子郵件是必填的');
      return;
    }

    const newVolunteer = {
      id: Date.now(),
      ...formData,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const updatedVolunteers = [...volunteers, newVolunteer];
    setVolunteers(updatedVolunteers);
    localStorage.setItem('volunteers', JSON.stringify(updatedVolunteers));
    
    setFormData({ name: '', phone: '', email: '', department: '' });
    setError('');
    setSuccess('志工新增成功！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const addSchedule = (e) => {
    e.preventDefault();
    if (!scheduleForm.volunteer_id || !scheduleForm.start_time || !scheduleForm.end_time) {
      setError('志工、開始時間和結束時間是必填的');
      return;
    }

    const newSchedule = {
      id: Date.now(),
      ...scheduleForm,
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    
    setScheduleForm({ 
      volunteer_id: '', 
      start_time: '', 
      end_time: '', 
      shift_type: 'morning',
      location: ''
    });
    setError('');
    setSuccess('排班新增成功！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getVolunteerName = (id) => {
    const volunteer = volunteers.find(v => v.id === parseInt(id));
    return volunteer ? volunteer.name : '未知';
  };

  const handleChange = (e, formType) => {
    if (formType === 'volunteer') {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } else {
      setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" gutterBottom align="center" color="primary">
          龜馬山志工排班系統
        </Typography>
        
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" color="textSecondary">
            註: 此版本使用瀏覽器本地儲存，資料僅保存在您的瀏覽器中
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="儀表板" />
          <Tab label="志工管理" />
          <Tab label="排班管理" />
        </Tabs>

        {activeTab === 0 && (
          <Dashboard volunteers={volunteers} schedules={schedules} />
        )}

        {activeTab === 1 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>新增志工</Typography>
              <form onSubmit={addVolunteer}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    name="name"
                    label="姓名 *"
                    value={formData.name}
                    onChange={(e) => handleChange(e, 'volunteer')}
                    required
                    fullWidth
                  />
                  <TextField
                    name="phone"
                    label="電話 *"
                    value={formData.phone}
                    onChange={(e) => handleChange(e, 'volunteer')}
                    required
                    fullWidth
                  />
                  <TextField
                    name="email"
                    label="電子郵件 *"
                    value={formData.email}
                    onChange={(e) => handleChange(e, 'volunteer')}
                    required
                    fullWidth
                  />
                  <TextField
                    name="department"
                    label="部門"
                    value={formData.department}
                    onChange={(e) => handleChange(e, 'volunteer')}
                    fullWidth
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    新增志工
                  </Button>
                </Box>
              </form>
            </Paper>

            <Typography variant="h6" gutterBottom>志工列表 ({volunteers.length} 人)</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>姓名</TableCell>
                    <TableCell>電話</TableCell>
                    <TableCell>電子郵件</TableCell>
                    <TableCell>部門</TableCell>
                    <TableCell>狀態</TableCell>
                    <TableCell>加入日期</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>{volunteer.phone}</TableCell>
                      <TableCell>{volunteer.email}</TableCell>
                      <TableCell>{volunteer.department}</TableCell>
                      <TableCell>{volunteer.status}</TableCell>
                      <TableCell>{new Date(volunteer.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>新增排班</Typography>
              <form onSubmit={addSchedule}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    name="volunteer_id"
                    label="志工 *"
                    select
                    value={scheduleForm.volunteer_id}
                    onChange={(e) => handleChange(e, 'schedule')}
                    required
                    fullWidth
                  >
                    {volunteers.map(volunteer => (
                      <option key={volunteer.id} value={volunteer.id}>
                        {volunteer.name} ({volunteer.department})
                      </option>
                    ))}
                  </TextField>
                  
                  <TextField
                    name="start_time"
                    label="開始時間 *"
                    type="datetime-local"
                    value={scheduleForm.start_time}
                    onChange={(e) => handleChange(e, 'schedule')}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <TextField
                    name="end_time"
                    label="結束時間 *"
                    type="datetime-local"
                    value={scheduleForm.end_time}
                    onChange={(e) => handleChange(e, 'schedule')}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <TextField
                    name="shift_type"
                    label="班別 *"
                    select
                    value={scheduleForm.shift_type}
                    onChange={(e) => handleChange(e, 'schedule')}
                    required
                    fullWidth
                  >
                    <option value="morning">上午班</option>
                    <option value="afternoon">下午班</option>
                    <option value="evening">晚上班</option>
                    <option value="all_day">全天班</option>
                  </TextField>
                  
                  <TextField
                    name="location"
                    label="地點"
                    value={scheduleForm.location}
                    onChange={(e) => handleChange(e, 'schedule')}
                    fullWidth
                  />
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    新增排班
                  </Button>
                </Box>
              </form>
            </Paper>

            <Typography variant="h6" gutterBottom>排班列表 ({schedules.length} 筆)</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>志工</TableCell>
                    <TableCell>開始時間</TableCell>
                    <TableCell>結束時間</TableCell>
                    <TableCell>班別</TableCell>
                    <TableCell>地點</TableCell>
                    <TableCell>狀態</TableCell>
                    <TableCell>建立日期</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{getVolunteerName(schedule.volunteer_id)}</TableCell>
                      <TableCell>{new Date(schedule.start_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(schedule.end_time).toLocaleString()}</TableCell>
                      <TableCell>{schedule.shift_type}</TableCell>
                      <TableCell>{schedule.location}</TableCell>
                      <TableCell>{schedule.status}</TableCell>
                      <TableCell>{new Date(schedule.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
    </Box>
  );
}

function Dashboard({ volunteers, schedules }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>系統總覽</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, flex: 1, textAlign: 'center', minWidth: 200 }}>
          <Typography variant="h5" color="primary">志工人數</Typography>
          <Typography variant="h3">{volunteers.length}</Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, textAlign: 'center', minWidth: 200 }}>
          <Typography variant="h5" color="secondary">排班數</Typography>
          <Typography variant="h3">{schedules.length}</Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, textAlign: 'center', minWidth: 200 }}>
          <Typography variant="h5" color="success.main">活躍志工</Typography>
          <Typography variant="h3">{volunteers.filter(v => v.status === 'active').length}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>系統資訊</Typography>
        <Typography variant="body2" color="text.secondary">
          此系統使用瀏覽器本地儲存，資料僅保存在您的瀏覽器中。
          關閉瀏覽器後資料仍會保留，但更換設備或清除瀏覽器資料會導致資料遺失。
        </Typography>
      </Paper>
    </Box>
  );
}

export default App;
