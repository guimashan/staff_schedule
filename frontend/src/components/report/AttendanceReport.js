// frontend/src/components/report/AttendanceReport.js
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
  Grid,
  Button
} from '@mui/material';
import { Search as SearchIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { LineChart, BarChart } from '@mui/x-charts';
import { reportAPI } from '../../services/api';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState({
    attendance: [],
    stats: {},
    monthlyTrend: [],
    volunteerAttendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    volunteerId: '',
    status: ''
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendanceReport();
  }, [filters]);

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getAttendanceReport(filters);
      setAttendanceData(response.data);
      setError('');
    } catch (error) {
      console.error('載入出勤報告失敗:', error);
      setError('載入出勤報告失敗，請稍後再試');
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

  const getFilteredAttendance = () => {
    let filtered = attendanceData.attendance;

    if (filters.dateFrom) {
      filtered = filtered.filter(attendance => new Date(attendance.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(attendance => new Date(attendance.date) <= new Date(filters.dateTo));
    }

    if (filters.volunteerId) {
      filtered = filtered.filter(attendance => attendance.volunteer_id === filters.volunteerId);
    }

    if (filters.status) {
      filtered = filtered.filter(attendance => attendance.status === filters.status);
    }

    return filtered;
  };

  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return getFilteredAttendance().slice(startIndex, endIndex);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'early_departure': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return '出席';
      case 'absent': return '缺席';
      case 'late': return '遲到';
      case 'early_departure': return '早退';
      default: return status;
    }
  };

  const getAttendanceRate = () => {
    const total = attendanceData.attendance.length;
    const present = attendanceData.attendance.filter(a => a.status === 'present').length;
    return total > 0 ? Math.round((present / total) * 100) : 0;
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
        <button onClick={fetchAttendanceReport}>重新載入</button>
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

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>志工</InputLabel>
          <Select
            value={filters.volunteerId}
            onChange={(e) => handleFilterChange('volunteerId', e.target.value)}
            label="志工"
          >
            <MenuItem value="">全部</MenuItem>
            {attendanceData.volunteerAttendance.map(vol => (
              <MenuItem key={vol.volunteer_id} value={vol.volunteer_id}>
                {vol.volunteer_name} ({vol.attendance_rate}%)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>狀態</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="狀態"
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="present">出席</MenuItem>
            <MenuItem value="absent">缺席</MenuItem>
            <MenuItem value="late">遲到</MenuItem>
            <MenuItem value="early_departure">早退</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 統計摘要 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {attendanceData.stats.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              總出勤記錄
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {attendanceData.stats.present || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              出席人數
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {attendanceData.stats.absent || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              缺席人數
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {getAttendanceRate()}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              整體出勤率
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 圖表 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              月度出勤趨勢
            </Typography>
            {attendanceData.monthlyTrend.length > 0 ? (
              <LineChart
                xAxis={[
                  {
                    id: 'months',
                    data: attendanceData.monthlyTrend.map(item => item.month),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: attendanceData.monthlyTrend.map(item => item.attendance_rate),
                    label: '出勤率',
                    color: '#4caf50'
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
              志工出勤率
            </Typography>
            {attendanceData.volunteerAttendance.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    id: 'volunteers',
                    data: attendanceData.volunteerAttendance.slice(0, 10).map(item => item.volunteer_name),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: attendanceData.volunteerAttendance.slice(0, 10).map(item => item.attendance_rate),
                    label: '出勤率%',
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

      {/* 出勤列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>志工姓名</TableCell>
              <TableCell>日期</TableCell>
              <TableCell>班別</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>到達時間</TableCell>
              <TableCell>離開時間</TableCell>
              <TableCell>備註</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell>{attendance.volunteer_name}</TableCell>
                <TableCell>
                  {new Date(attendance.date).toLocaleDateString('zh-TW')}
                </TableCell>
                <TableCell>{attendance.shift_type}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(attendance.status)}
                    color={getStatusColor(attendance.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{attendance.arrival_time || '-'}</TableCell>
                <TableCell>{attendance.departure_time || '-'}</TableCell>
                <TableCell>{attendance.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁 */}
      {getFilteredAttendance().length > rowsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3,
          alignItems: 'center'
        }}>
          <Pagination
            count={Math.ceil(getFilteredAttendance().length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
          <Typography sx={{ ml: 2 }}>
            顯示 {Math.min((page - 1) * rowsPerPage + 1, getFilteredAttendance().length)} - {Math.min(page * rowsPerPage, getFilteredAttendance().length)} / {getFilteredAttendance().length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceReport;
