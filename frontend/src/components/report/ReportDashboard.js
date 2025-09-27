// frontend/src/components/report/ReportDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import { reportAPI } from '../../services/api';

const ReportDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalSchedules: 0,
    confirmedSchedules: 0,
    volunteerByDepartment: [],
    scheduleByMonth: [],
    attendanceTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (error) {
      console.error('載入總覽資料失敗:', error);
      setError('載入總覽資料失敗，請稍後再試');
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <button onClick={fetchDashboardData}>重新載入</button>
      </Box>
    );
  }

  return (
    <Box>
      {/* 總覽卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                總志工人數
              </Typography>
              <Typography variant="h4" color="primary">
                {dashboardData.totalVolunteers}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                活躍: {dashboardData.activeVolunteers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                總排班數
              </Typography>
              <Typography variant="h4" color="success.main">
                {dashboardData.totalSchedules}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                已確認: {dashboardData.confirmedSchedules}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                出勤率
              </Typography>
              <Typography variant="h4" color="info.main">
                {dashboardData.attendanceRate || 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                本月出勤率
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                本月排班
              </Typography>
              <Typography variant="h4" color="warning.main">
                {dashboardData.currentMonthSchedules || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                本月總排班數
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 圖表區域 */}
      <Grid container spacing={3}>
        {/* 部門分布餅圖 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              志工部門分布
            </Typography>
            {dashboardData.volunteerByDepartment.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: dashboardData.volunteerByDepartment.map(dept => ({
                      id: dept.department,
                      value: dept.count,
                      label: `${dept.department} (${dept.count})`
                    }))
                  }
                ]}
                width={500}
                height={250}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                無資料
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* 月度排班柱狀圖 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              月度排班趨勢
            </Typography>
            {dashboardData.scheduleByMonth.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    id: 'months',
                    data: dashboardData.scheduleByMonth.map(item => item.month),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: dashboardData.scheduleByMonth.map(item => item.count),
                    label: '排班數',
                    color: '#1976d2'
                  }
                ]}
                width={500}
                height={250}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                無資料
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* 出勤趨勢線圖 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              出勤率趨勢
            </Typography>
            {dashboardData.attendanceTrend.length > 0 ? (
              <LineChart
                xAxis={[
                  {
                    id: 'dates',
                    data: dashboardData.attendanceTrend.map(item => item.date),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: dashboardData.attendanceTrend.map(item => item.rate),
                    label: '出勤率',
                    color: '#4caf50'
                  }
                ]}
                width={800}
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
    </Box>
  );
};

export default ReportDashboard;
