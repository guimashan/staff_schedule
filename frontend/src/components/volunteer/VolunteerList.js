// frontend/src/components/volunteer/VolunteerList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Pagination,
  LinearProgress,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ImportExport as ImportIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { volunteerAPI } from '../../services/api';
import VolunteerForm from './VolunteerForm';

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openForm, setOpenForm] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 顯示通知
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 獲取志工列表
  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await volunteerAPI.getAll();
      setVolunteers(response.data);
      setFilteredVolunteers(response.data);
      setError('');
    } catch (error) {
      console.error('載入志工資料失敗:', error);
      setError('載入志工資料失敗，請稍後再試');
      showSnackbar('載入志工資料失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  // 過濾志工資料
  useEffect(() => {
    let filtered = volunteers;

    // 搜索過濾
    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 狀態過濾
    if (statusFilter) {
      filtered = filtered.filter(volunteer => volunteer.status === statusFilter);
    }

    setFilteredVolunteers(filtered);
    setTotalPages(Math.ceil(filtered.length / rowsPerPage));
  }, [volunteers, searchTerm, statusFilter, rowsPerPage]);

  // 獲取當前頁面的資料
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredVolunteers.slice(startIndex, endIndex);
  };

  const handleOpenForm = (volunteer = null) => {
    setCurrentVolunteer(volunteer);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentVolunteer(null);
  };

  const handleSave = () => {
    fetchVolunteers();
    handleCloseForm();
    showSnackbar(currentVolunteer ? '志工資料更新成功' : '志工資料新增成功');
  };

  const handleDelete = async (volunteerId) => {
    if (window.confirm('確定要刪除此志工嗎？此操作無法復原。')) {
      try {
        await volunteerAPI.delete(volunteerId);
        fetchVolunteers();
        showSnackbar('志工資料刪除成功', 'success');
      } catch (error) {
        console.error('刪除志工失敗:', error);
        showSnackbar('刪除志工失敗，請稍後再試', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return '活躍';
      case 'inactive':
        return '非活躍';
      case 'pending':
        return '待審核';
      default:
        return status;
    }
  };

  const handleImportClick = () => {
    window.location.href = '/volunteers/import';
  };

  const handleStatsClick = () => {
    window.location.href = '/volunteers/stats';
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
        <Button variant="contained" onClick={fetchVolunteers}>
          重新載入
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 標題和操作按鈕 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1">
          志工管理
        </Typography>
        
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            新增志工
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ImportIcon />}
            onClick={handleImportClick}
          >
            批量導入
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<AssessmentIcon />}
            onClick={handleStatsClick}
          >
            統計報表
          </Button>
        </Stack>
      </Box>

      {/* 搜索和過濾 */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3, 
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        <TextField
          label="搜尋志工"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>狀態過濾</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="狀態過濾"
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="active">活躍</MenuItem>
            <MenuItem value="inactive">非活躍</MenuItem>
            <MenuItem value="pending">待審核</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 志工列表表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>電話</TableCell>
              <TableCell>電子郵件</TableCell>
              <TableCell>部門</TableCell>
              <TableCell>技能</TableCell>
              <TableCell>經驗年數</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>加入日期</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((volunteer) => (
              <TableRow 
                key={volunteer.id}
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {volunteer.name}
                  </Typography>
                </TableCell>
                <TableCell>{volunteer.phone}</TableCell>
                <TableCell>{volunteer.email}</TableCell>
                <TableCell>{volunteer.department}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                    {volunteer.skills?.split(',').map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill.trim()}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>{volunteer.experience_years || 0} 年</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(volunteer.status)}
                    color={getStatusColor(volunteer.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(volunteer.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="編輯">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenForm(volunteer)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(volunteer.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁 */}
      {filteredVolunteers.length > rowsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3,
          alignItems: 'center'
        }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
          <Typography sx={{ ml: 2 }}>
            顯示 {Math.min((page - 1) * rowsPerPage + 1, filteredVolunteers.length)} - {Math.min(page * rowsPerPage, filteredVolunteers.length)} / {filteredVolunteers.length}
          </Typography>
        </Box>
      )}

      {/* 志工表單對話框 */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            handleSave();
          },
        }}
      >
        <DialogTitle>
          {currentVolunteer ? '編輯志工' : '新增志工'}
        </DialogTitle>
        <DialogContent dividers>
          <VolunteerForm
            volunteer={currentVolunteer}
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
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default VolunteerList;
