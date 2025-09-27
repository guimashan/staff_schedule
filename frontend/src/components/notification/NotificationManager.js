// frontend/src/components/notification/NotificationManager.js
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
  IconButton,
  Badge,
  Stack
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import NotificationList from './NotificationList';
import NotificationForm from './NotificationForm';
import NotificationSettings from './NotificationSettings';
import { notificationAPI } from '../../services/api';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openForm, setOpenForm] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // 顯示通知
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 獲取通知列表
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
      setError('');
    } catch (error) {
      console.error('載入通知失敗:', error);
      setError('載入通知失敗，請稍後再試');
      showSnackbar('載入通知失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpenForm = (notification = null) => {
    setCurrentNotification(notification);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentNotification(null);
  };

  const handleSave = () => {
    fetchNotifications();
    handleCloseForm();
    showSnackbar(currentNotification ? '通知更新成功' : '通知新增成功');
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
        <Button variant="contained" onClick={fetchNotifications}>
          重新載入
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4">通知管理</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            新增通知
          </Button>
        </Stack>
      </Box>

      {/* 標籤頁 */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="通知列表" />
        <Tab label="通知設定" />
      </Tabs>

      {/* 標籤頁內容 */}
      {activeTab === 0 && (
        <NotificationList
          notifications={notifications}
          onEdit={handleOpenForm}
          onDelete={async (id) => {
            try {
              await notificationAPI.delete(id);
              fetchNotifications();
              showSnackbar('通知已刪除', 'success');
            } catch (error) {
              console.error('刪除通知失敗:', error);
              showSnackbar('刪除通知失敗', 'error');
            }
          }}
          onMarkRead={async (id) => {
            try {
              await notificationAPI.markAsRead(id);
              fetchNotifications();
            } catch (error) {
              console.error('標記為已讀失敗:', error);
            }
          }}
        />
      )}

      {activeTab === 1 && (
        <NotificationSettings />
      )}

      {/* 通知表單對話框 */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {currentNotification ? '編輯通知' : '新增通知'}
        </DialogTitle>
        <DialogContent dividers>
          <NotificationForm
            notification={currentNotification}
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
  );
};

export default NotificationManager;
