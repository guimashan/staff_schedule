// frontend/src/components/schedule/ScheduleManager.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar,
  Alert as MuiAlert,
  IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleList from './ScheduleList';
import ScheduleForm from './ScheduleForm';
import ScheduleStats from './ScheduleStats';
import { scheduleAPI } from '../../services/api';
import { volunteerAPI } from '../../services/api';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openForm, setOpenForm] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // 顯示通知
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 獲取排班和志工資料
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedulesRes, volunteersRes] = await Promise.all([
        scheduleAPI.getAll(),
        volunteerAPI.getAll()
      ]);
      setSchedules(schedulesRes.data);
      setVolunteers(volunteersRes.data);
      setError('');
    } catch (error) {
      console.error('載入資料失敗:', error);
      setError('載入資料失敗，請稍後再試');
      showSnackbar('載入資料失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (schedule = null) => {
    setCurrentSchedule(schedule);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentSchedule(null);
  };

  const handleSave = () => {
    fetchData();
    handleCloseForm();
    showSnackbar(currentSchedule ? '排班更新成功' : '排班新增成功');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>載入中...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchData}>
          重新載入
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4">排班管理</Typography>
          <Button 
            variant="contained" 
            onClick={() => handleOpenForm()}
          >
            新增排班
          </Button>
        </Box>

        {/* 標籤頁 */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="日曆視圖" />
          <Tab label="列表視圖" />
          <Tab label="統計報表" />
        </Tabs>

        {/* 標籤頁內容 */}
        {activeTab === 0 && (
          <Paper sx={{ p: 2, height: 600 }}>
            <ScheduleCalendar 
              schedules={schedules}
              volunteers={volunteers}
              onScheduleClick={handleOpenForm}
              onAddSchedule={() => handleOpenForm()}
            />
          </Paper>
        )}

        {activeTab === 1 && (
          <ScheduleList
            schedules={schedules}
            volunteers={volunteers}
            onEdit={handleOpenForm}
            onDelete={async (id) => {
              try {
                await scheduleAPI.delete(id);
                fetchData();
                showSnackbar('排班已刪除', 'success');
              } catch (error) {
                console.error('刪除排班失敗:', error);
                showSnackbar('刪除排班失敗', 'error');
              }
            }}
          />
        )}

        {activeTab === 2 && (
          <ScheduleStats schedules={schedules} volunteers={volunteers} />
        )}

        {/* 排班表單對話框 */}
        <Dialog 
          open={openForm} 
          onClose={handleCloseForm} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            {currentSchedule ? '編輯排班' : '新增排班'}
          </DialogTitle>
          <DialogContent dividers>
            <ScheduleForm
              schedule={currentSchedule}
              volunteers={volunteers}
              onSave={handleSave}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>

        {/* 通知欄 */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleCloseSnackbar}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleManager;
