// frontend/src/components/report/ScheduleReport.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert,
  Chip,
  Pagination,
  Stack,
  Grid
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { BarChart, PieChart } from '@mui/x-charts';
import { reportAPI } from '../../services/api';

const ScheduleReport = () => {
  const [scheduleData, setScheduleData] = useState({
    schedules: [],
    stats: {},
    shiftStats: [],
    volunteerStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    shiftType: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchScheduleReport();
  }, [filters]);

  const fetchScheduleReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getScheduleReport(filters);
      setScheduleData(response.data);
      setError('');
    } catch (error) {
      console.error('載入排班報告失敗:', error);
      setError('載入排班報告失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // 重置頁面
  };

  const getFilteredSchedules = () => {
    let filtered = scheduleData.schedules;

    if (filters.search) {
      filtered = filtered.filter(schedule =>
        schedule.volunteer_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        schedule.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(schedule => schedule.status === filters.status);
    }

    if (filters.shiftType) {
      filtered = filtered.filter(schedule => schedule.shift_type === filters.shiftType);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(schedule => new Date(schedule.start_time) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(schedule => new Date(schedule.start_time) <= new Date(filters.dateTo));
    }

    return filtered;
  };

  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return getFilteredSchedules().slice(startIndex, endIndex);
  };

  const getShiftLabel = (shiftType) => {
    switch (shiftType) {
      case 'morning': return '上午班';
      case 'afternoon': return '下午班';
      case 'evening': return '晚上班';
      case 'all_day': return '全天班';
      case 'night': return '夜班';
      default: return shiftType;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return '已排班';
      case 'confirmed': return '已確認';
      case 'cancelled': return '已取消';
      default: return status;
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <button onClick={fetchScheduleReport}>重新載入</button>
      </Box>
    );
  }

  return (
    <Box>
      {/* 搜索和過濾 */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3, 
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        <TextField
          label="搜尋排班"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>狀態</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="狀態"
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="scheduled">已排班</MenuItem>
            <MenuItem value="confirmed">已確認</MenuItem>
            <MenuItem value="cancelled">已取消</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>班別</InputLabel>
          <Select
            value={filters.shiftType}
            onChange={(e) => handleFilterChange('shiftType', e.target.value)}
            label="班別"
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="morning">上午班</MenuItem>
            <MenuItem value="afternoon">下午班</MenuItem>
            <MenuItem value="evening">晚上班</MenuItem>
            <MenuItem value="all_day">全天班</MenuItem>
            <MenuItem value="night">夜班</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="開始日期"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          label="結束日期"
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      {/* 統計摘要 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {scheduleData.stats.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              總排班數
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {scheduleData.stats.confirmed || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              已確認
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {scheduleData.stats.scheduled || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              已排班
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {scheduleData.stats.cancelled || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              已取消
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 圖表 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              班別分布
            </Typography>
            {scheduleData.shiftStats.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: scheduleData.shiftStats.map(shift => ({
                      id: shift.shift_type,
                      value: shift.count,
                      label: `${getShiftLabel(shift.shift_type)} (${shift.count})`
                    }))
                  }
                ]}
                width={400}
                height={250}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                無資料
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              志工排班數
            </Typography>
            {scheduleData.volunteerStats.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    id: 'volunteers',
                    data: scheduleData.volunteerStats.slice(0, 10).map(item => item.volunteer_name),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: scheduleData.volunteerStats.slice(0, 10).map(item => item.count),
                    label: '排班數',
                    color: '#1976d2'
                  }
                ]}
                width={400}
                height={250}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                無資料
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 排班列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>志工姓名</TableCell>
              <TableCell>開始時間</TableCell>
              <TableCell>結束時間</TableCell>
              <TableCell>班別</TableCell>
              <TableCell>地點</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>排班時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.volunteer_name}</TableCell>
                <TableCell>
                  {new Date(schedule.start_time).toLocaleString('zh-TW')}
                </TableCell>
                <TableCell>
                  {new Date(schedule.end_time).toLocaleString('zh-TW')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getShiftLabel(schedule.shift_type)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{schedule.location}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(schedule.status)}
                    color={getStatusColor(schedule.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(schedule.created_at).toLocaleString('zh-TW')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁 */}
      {getFilteredSchedules().length > rowsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3,
          alignItems: 'center'
        }}>
          <Pagination
            count={Math.ceil(getFilteredSchedules().length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
          <Typography sx={{ ml: 2 }}>
            顯示 {Math.min((page - 1) * rowsPerPage + 1, getFilteredSchedules().length)} - {Math.min(page * rowsPerPage, getFilteredSchedules().length)} / {getFilteredSchedules().length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ScheduleReport;
