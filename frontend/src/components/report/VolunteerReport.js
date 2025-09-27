// frontend/src/components/report/VolunteerReport.js
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
  Stack,
  Chip,
  Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { BarChart, PieChart } from '@mui/x-charts';
import { reportAPI } from '../../services/api';

const VolunteerReport = () => {
  const [volunteerData, setVolunteerData] = useState({
    volunteers: [],
    stats: {},
    departmentStats: [],
    skillStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    skill: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchVolunteerReport();
  }, [filters]);

  const fetchVolunteerReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getVolunteerReport(filters);
      setVolunteerData(response.data);
      setError('');
    } catch (error) {
      console.error('載入志工報告失敗:', error);
      setError('載入志工報告失敗，請稍後再試');
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

  const getFilteredVolunteers = () => {
    let filtered = volunteerData.volunteers;

    if (filters.search) {
      filtered = filtered.filter(volunteer =>
        volunteer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        volunteer.department.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.department) {
      filtered = filtered.filter(volunteer => volunteer.department === filters.department);
    }

    if (filters.status) {
      filtered = filtered.filter(volunteer => volunteer.status === filters.status);
    }

    return filtered;
  };

  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return getFilteredVolunteers().slice(startIndex, endIndex);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return '活躍';
      case 'inactive': return '非活躍';
      case 'pending': return '待審核';
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
        <button onClick={fetchVolunteerReport}>重新載入</button>
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
          label="搜尋志工"
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
          <InputLabel>部門</InputLabel>
          <Select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            label="部門"
          >
            <MenuItem value="">全部</MenuItem>
            {volunteerData.departmentStats.map(dept => (
              <MenuItem key={dept.department} value={dept.department}>
                {dept.department} ({dept.count})
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
            <MenuItem value="active">活躍</MenuItem>
            <MenuItem value="inactive">非活躍</MenuItem>
            <MenuItem value="pending">待審核</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 統計摘要 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {volunteerData.stats.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              總志工人數
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {volunteerData.stats.active || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              活躍志工
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {volunteerData.stats.pending || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              待審核
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {volunteerData.stats.inactive || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              非活躍
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 圖表 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              部門分布
            </Typography>
            {volunteerData.departmentStats.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: volunteerData.departmentStats.map(dept => ({
                      id: dept.department,
                      value: dept.count,
                      label: `${dept.department} (${dept.count})`
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
              技能分布
            </Typography>
            {volunteerData.skillStats.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    id: 'skills',
                    data: volunteerData.skillStats.slice(0, 10).map(item => item.skill),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: volunteerData.skillStats.slice(0, 10).map(item => item.count),
                    label: '人數',
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

      {/* 志工列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>部門</TableCell>
              <TableCell>技能</TableCell>
              <TableCell>經驗年數</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>加入日期</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((volunteer) => (
              <TableRow key={volunteer.id}>
                <TableCell>{volunteer.name}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁 */}
      {getFilteredVolunteers().length > rowsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3,
          alignItems: 'center'
        }}>
          <Pagination
            count={Math.ceil(getFilteredVolunteers().length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
          <Typography sx={{ ml: 2 }}>
            顯示 {Math.min((page - 1) * rowsPerPage + 1, getFilteredVolunteers().length)} - {Math.min(page * rowsPerPage, getFilteredVolunteers().length)} / {getFilteredVolunteers().length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VolunteerReport;
