// frontend/src/components/schedule/ScheduleForm.js
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
  Tooltip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Info as InfoIcon } from '@mui/icons-material';
import { scheduleAPI } from '../../services/api';

const ScheduleForm = ({ schedule, volunteers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    volunteer_id: '',
    start_time: new Date(),
    end_time: new Date(),
    shift_type: 'morning',
    location: '',
    notes: '',
    status: 'scheduled'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        ...schedule,
        start_time: new Date(schedule.start_time),
        end_time: new Date(schedule.end_time)
      });
    }
  }, [schedule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.volunteer_id) {
      setError('請選擇志工');
      return false;
    }
    if (!formData.start_time) {
      setError('請選擇開始時間');
      return false;
    }
    if (!formData.end_time) {
      setError('請選擇結束時間');
      return false;
    }
    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      setError('結束時間必須晚於開始時間');
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
      if (schedule) {
        await scheduleAPI.update(schedule.id, formData);
      } else {
        await scheduleAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('保存失敗:', error);
      setError(error.response?.data?.message || error.message || '保存失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const getVolunteerName = (id) => {
    const volunteer = volunteers.find(v => v.id === id);
    return volunteer ? volunteer.name : '';
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
            排班資訊
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth margin="normal">
            <InputLabel>志工 *</InputLabel>
            <Select
              name="volunteer_id"
              value={formData.volunteer_id}
              onChange={handleChange}
              required
            >
              {volunteers.map(volunteer => (
                <MenuItem key={volunteer.id} value={volunteer.id}>
                  {volunteer.name} ({volunteer.department})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="開始時間 *"
            value={formData.start_time}
            onChange={(value) => handleDateChange('start_time', value)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="結束時間 *"
            value={formData.end_time}
            onChange={(value) => handleDateChange('end_time', value)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>班別 *</InputLabel>
            <Select
              name="shift_type"
              value={formData.shift_type}
              onChange={handleChange}
              required
            >
              <MenuItem value="morning">上午班 (08:00-12:00)</MenuItem>
              <MenuItem value="afternoon">下午班 (12:00-17:00)</MenuItem>
              <MenuItem value="evening">晚上班 (17:00-21:00)</MenuItem>
              <MenuItem value="all_day">全天班 (08:00-17:00)</MenuItem>
              <MenuItem value="night">夜班 (21:00-08:00)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>狀態</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="scheduled">已排班</MenuItem>
              <MenuItem value="confirmed">已確認</MenuItem>
              <MenuItem value="cancelled">已取消</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="地點"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="排班地點">
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
            label="備註"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="排班相關的特別說明..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="額外備註">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* 排班摘要 */}
        <Grid item xs={12}>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" gutterBottom>
              排班摘要
            </Typography>
            <Typography variant="body2">
              <strong>志工:</strong> {getVolunteerName(formData.volunteer_id)}<br />
              <strong>時間:</strong> {formData.start_time ? new Date(formData.start_time).toLocaleString('zh-TW') : ''} - {formData.end_time ? new Date(formData.end_time).toLocaleString('zh-TW') : ''}<br />
              <strong>班別:</strong> {formData.shift_type === 'morning' ? '上午班' : 
                                    formData.shift_type === 'afternoon' ? '下午班' : 
                                    formData.shift_type === 'evening' ? '晚上班' : 
                                    formData.shift_type === 'all_day' ? '全天班' : 
                                    formData.shift_type === 'night' ? '夜班' : formData.shift_type}<br />
              <strong>狀態:</strong> {formData.status === 'scheduled' ? '已排班' : 
                                  formData.status === 'confirmed' ? '已確認' : 
                                  formData.status === 'cancelled' ? '已取消' : formData.status}
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
          disabled={loading}
        >
          {loading ? '保存中...' : schedule ? '更新' : '新增'}
        </Button>
      </Box>
    </form>
  );
};

export default ScheduleForm;
