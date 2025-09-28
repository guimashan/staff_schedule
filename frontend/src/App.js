// frontend/src/App.js (簡化版)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  Alert
} from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            龜馬山志工排班系統
          </Typography>
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/volunteers" element={<VolunteerManager />} />
            <Route path="/schedules" element={<ScheduleManager />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

// 儀表板組件
function Dashboard() {
  const [stats, setStats] = useState({ volunteers: 0, schedules: 0 });

  useEffect(() => {
    // 獲取統計數據
    fetch('/api/volunteers')
      .then(res => res.json())
      .then(volunteers => {
        setStats(prev => ({ ...prev, volunteers: volunteers.length }));
      });
    
    fetch('/api/schedules')
      .then(res => res.json())
      .then(schedules => {
        setStats(prev => ({ ...prev, schedules: schedules.length }));
      });
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>系統總覽</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">志工人數</Typography>
          <Typography variant="h3">{stats.volunteers}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h5" color="secondary">排班數</Typography>
          <Typography variant="h3">{stats.schedules}</Typography>
        </Paper>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" href="/volunteers">管理志工</Button>
        <Button variant="contained" href="/schedules">管理排班</Button>
      </Box>
    </Box>
  );
}

// 志工管理組件
function VolunteerManager() {
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers');
      const data = await response.json();
      setVolunteers(data);
    } catch (err) {
      setError('載入志工資料失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: '', phone: '', email: '', department: '' });
        fetchVolunteers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '新增志工失敗');
      }
    } catch (err) {
      setError('新增志工失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>志工管理</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>新增志工</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              name="name"
              label="姓名"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="phone"
              label="電話"
              value={formData.phone}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="email"
              label="電子郵件"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="department"
              label="部門"
              value={formData.department}
              onChange={handleChange}
              fullWidth
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ alignSelf: 'flex-end' }}
            >
              {loading ? '新增中...' : '新增志工'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h6" gutterBottom>志工列表</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>電話</TableCell>
              <TableCell>電子郵件</TableCell>
              <TableCell>部門</TableCell>
              <TableCell>狀態</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// 排班管理組件
function ScheduleManager() {
  const [schedules, setSchedules] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({ 
    volunteer_id: '', 
    start_time: '', 
    end_time: '', 
    shift_type: 'morning',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchVolunteers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError('載入排班資料失敗');
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers');
      const data = await response.json();
      setVolunteers(data);
    } catch (err) {
      setError('載入志工資料失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ 
          volunteer_id: '', 
          start_time: '', 
          end_time: '', 
          shift_type: 'morning',
          location: ''
        });
        fetchSchedules();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '新增排班失敗');
      }
    } catch (err) {
      setError('新增排班失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getVolunteerName = (id) => {
    const volunteer = volunteers.find(v => v.id === parseInt(id));
    return volunteer ? volunteer.name : '未知';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>排班管理</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>新增排班</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              name="volunteer_id"
              label="志工"
              select
              value={formData.volunteer_id}
              onChange={handleChange}
              required
              fullWidth
            >
              {volunteers.map(volunteer => (
                <MenuItem key={volunteer.id} value={volunteer.id}>
                  {volunteer.name} ({volunteer.department})
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              name="start_time"
              label="開始時間"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              required
              fullWidth
            />
            
            <TextField
              name="end_time"
              label="結束時間"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              required
              fullWidth
            />
            
            <TextField
              name="shift_type"
              label="班別"
              select
              value={formData.shift_type}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="morning">上午班</MenuItem>
              <MenuItem value="afternoon">下午班</MenuItem>
              <MenuItem value="evening">晚上班</MenuItem>
              <MenuItem value="all_day">全天班</MenuItem>
            </TextField>
            
            <TextField
              name="location"
              label="地點"
              value={formData.location}
              onChange={handleChange}
              fullWidth
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ alignSelf: 'flex-end' }}
            >
              {loading ? '新增中...' : '新增排班'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h6" gutterBottom>排班列表</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>志工</TableCell>
              <TableCell>開始時間</TableCell>
              <TableCell>結束時間</TableCell>
              <TableCell>班別</TableCell>
              <TableCell>地點</TableCell>
              <TableCell>狀態</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default App;
