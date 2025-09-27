// frontend/src/components/notification/NotificationSettings.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  LinearProgress,
  Button,
  Stack
} from '@mui/material';
import { notificationAPI } from '../../services/api';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    schedule_reminders: true,
    schedule_reminder_time: 30,
    auto_mark_as_read: false,
    notification_sound: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // 在實際應用中，這裡會從API獲取用戶設定
      // 暫時使用本地設定
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setError('');
    } catch (error) {
      console.error('載入設定失敗:', error);
      setError('載入設定失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // 在實際應用中，這裡會保存到API
      // 暫時保存到本地存儲
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      setSuccess('設定已保存');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('保存設定失敗:', error);
      setError('保存設定失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>載入中...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        通知設定
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            通知方式設定
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                />
              }
              label="電子郵件通知"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.push_notifications}
                  onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                />
              }
              label="推播通知"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sms_notifications}
                  onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
                />
              }
              label="簡訊通知"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notification_sound}
                  onChange={(e) => handleSettingChange('notification_sound', e.target.checked)}
                />
              }
              label="通知音效"
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            排班提醒設定
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.schedule_reminders}
                  onChange={(e) => handleSettingChange('schedule_reminders', e.target.checked)}
                />
              }
              label="啟用排班提醒"
            />
            
            <Box sx={{ pl: 3 }}>
              <Typography variant="body2" color="text.secondary">
                排班前 {settings.schedule_reminder_time} 分鐘提醒
              </Typography>
              <input
                type="range"
                min="5"
                max="120"
                value={settings.schedule_reminder_time}
                onChange={(e) => handleSettingChange('schedule_reminder_time', parseInt(e.target.value))}
                style={{ width: '100%', marginTop: '8px' }}
              />
              <Typography variant="caption" display="block">
                {settings.schedule_reminder_time} 分鐘
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            其他設定
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.auto_mark_as_read}
                  onChange={(e) => handleSettingChange('auto_mark_as_read', e.target.checked)}
                />
              }
              label="自動標記為已讀"
            />
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          保存設定
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
