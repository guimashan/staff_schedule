// frontend/src/components/volunteer/VolunteerForm.js
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
  Chip,
  Stack,
  Autocomplete,
  Typography,
  Divider,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import { volunteerAPI } from '../../services/api';

const VolunteerForm = ({ volunteer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    skills: '',
    experience_years: 0,
    emergency_contact: '',
    emergency_phone: '',
    address: '',
    birth_date: '',
    status: 'active',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([
    '接待服務', '導覽解說', '活動策劃', '文書處理', '美工設計', 
    '攝影記錄', '醫療保健', '外語翻譯', '資訊管理', '交通指引',
    '環境維護', '安全維護', '餐飲服務', '物資管理', '其他'
  ]);

  useEffect(() => {
    if (volunteer) {
      setFormData({
        ...volunteer,
        skills: volunteer.skills || '',
        experience_years: volunteer.experience_years || 0,
        emergency_contact: volunteer.emergency_contact || '',
        emergency_phone: volunteer.emergency_phone || '',
        address: volunteer.address || '',
        birth_date: volunteer.birth_date || '',
        notes: volunteer.notes || ''
      });
    }
  }, [volunteer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (event, value) => {
    const skills = value.join(', ');
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('請填寫姓名');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('請填寫電話');
      return false;
    }
    if (!formData.email.trim()) {
      setError('請填寫電子郵件');
      return false;
    }
    if (!formData.department.trim()) {
      setError('請填寫部門');
      return false;
    }
    
    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請填寫有效的電子郵件地址');
      return false;
    }

    // 驗證電話格式
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('請填寫有效的手機號碼格式 (09開頭的10位數字)');
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
      if (volunteer) {
        await volunteerAPI.update(volunteer.id, formData);
      } else {
        await volunteerAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('保存失敗:', error);
      setError(error.response?.data?.message || error.message || '保存失敗，請稍後再試');
    } finally {
      setLoading(false);
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
            基本資訊
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="姓名 *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={!formData.name.trim()}
            helperText={!formData.name.trim() ? '此欄位為必填' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="電話 *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            error={!formData.phone.trim()}
            helperText={!formData.phone.trim() ? '此欄位為必填' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="電子郵件 *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={!formData.email.trim()}
            helperText={!formData.email.trim() ? '此欄位為必填' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="部門 *"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            error={!formData.department.trim()}
            helperText={!formData.department.trim() ? '此欄位為必填' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="地址"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="生日"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* 技能與經驗 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            技能與經驗
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={availableSkills}
            value={formData.skills ? formData.skills.split(', ').filter(skill => skill.trim() !== '') : []}
            onChange={handleSkillsChange}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="技能專長"
                placeholder="選擇或輸入技能"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="志工經驗年數"
            name="experience_years"
            type="number"
            value={formData.experience_years}
            onChange={handleChange}
            inputProps={{ min: 0, max: 50 }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>狀態</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="active">活躍</MenuItem>
              <MenuItem value="inactive">非活躍</MenuItem>
              <MenuItem value="pending">待審核</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 緊急聯絡資訊 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            緊急聯絡資訊
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="緊急聯絡人"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="緊急聯絡電話"
            name="emergency_phone"
            value={formData.emergency_phone}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">+886</InputAdornment>,
            }}
          />
        </Grid>

        {/* 備註 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="備註"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="其他需要記錄的資訊..."
          />
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
          {loading ? '保存中...' : volunteer ? '更新' : '新增'}
        </Button>
      </Box>
    </form>
  );
};

export default VolunteerForm;
