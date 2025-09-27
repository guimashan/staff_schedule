// frontend/src/components/notification/NotificationForm.js
import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  Grid,
  Typography,
  Divider,
  LinearProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { Info as InfoIcon, Send as SendIcon } from '@mui/icons-material';
import { notificationAPI } from '../../services/api';

const NotificationForm = ({ notification, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'normal',
    is_broadcast: false,
    recipient_ids: [],
    scheduled_time: null,
    is_read: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (notification) {
      setFormData({
        ...notification,
        recipient_ids: notification.recipient_ids || [],
        scheduled_time: notification.scheduled_time || null
      });
    }
  }, [notification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecipientChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      recipient_ids: Array.isArray(value) ? value : [value]
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('請填寫通知標題');
      return false;
    }
    if (!formData.content.trim()) {
      setError('請填寫通知內容');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (notification) {
        await notificationAPI.update(notification.id, formData);
      } else {
        await notificationAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('保存失敗:', error);
      setError(error.response?.data?.message || error.message || '保存失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return '低優先';
      case 'normal': return '一般';
      case 'high': return '高優先';
      case 'urgent': return '緊急';
      default: return priority;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'system': return '系統通知';
      case 'schedule': return '排班通知';
      case 'alert': return '警示通知';
      case 'info': return '資訊通知';
      case 'warning': return '警告通知';
      default: return type;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loading && <LinearProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 基本資訊 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            通知資訊
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="標題 *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            error={!formData.title.trim()}
            helperText={!formData.title.trim() ? '此欄位為必填' : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="通知標題">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="內容 *"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            multiline
            rows={4}
            error={!formData.content.trim()}
            helperText={!formData.content.trim() ? '此欄位為必填' : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="通知內容">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>類型 *</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="info">資訊通知</MenuItem>
              <MenuItem value="system">系統通知</MenuItem>
              <MenuItem value="schedule">排班通知</MenuItem>
              <MenuItem value="warning">警告通知</MenuItem>
              <MenuItem value="alert">警示通知</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>優先等級 *</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <MenuItem value="low">低優先</MenuItem>
              <MenuItem value="normal">一般</MenuItem>
              <MenuItem value="high">高優先</MenuItem>
              <MenuItem value="urgent">緊急</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_broadcast}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_broadcast: e.target.checked }))}
                />
              }
              label="廣播通知 (發送給所有用戶)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_read}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_read: e.target.checked }))}
                />
              }
              label="標記為已讀"
            />
          </Stack>
        </Grid>

        {/* 預定發送時間 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            發送設定
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="預定發送時間"
            name="scheduled_time"
            type="datetime-local"
            value={formData.scheduled_time || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="預定發送時間，留空則立即發送">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* 通知摘要 */}
        <Grid item xs={12}>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" gutterBottom>
              通知摘要
            </Typography>
            <Typography variant="body2">
              <strong>標題:</strong> {formData.title}<br />
              <strong>類型:</strong> {getTypeLabel(formData.type)}<br />
              <strong>優先等級:</strong> {getPriorityLabel(formData.priority)}<br />
              <strong>廣播:</strong> {formData.is_broadcast ? '是' : '否'}<br />
              <strong>預定發送:</strong> {formData.scheduled_time ? new Date(formData.scheduled_time).toLocaleString('zh-TW') : '立即發送'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 按鈕 */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          取消
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SendIcon />}
          disabled={loading}
        >
          {loading ? '發送中...' : notification ? '更新' : '發送'}
        </Button>
      </Box>
    </form>
  );
};

export default NotificationForm;
