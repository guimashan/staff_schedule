// frontend/src/components/schedule/ScheduleStats.js
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CardHeader,
  Avatar,
  Stack
} from '@mui/material';

const ScheduleStats = ({ schedules, volunteers }) => {
  // 計算統計資料
  const totalSchedules = schedules.length;
  const scheduledCount = schedules.filter(s => s.status === 'scheduled').length;
  const confirmedCount = schedules.filter(s => s.status === 'confirmed').length;
  const cancelledCount = schedules.filter(s => s.status === 'cancelled').length;

  // 按班別統計
  const byShiftType = schedules.reduce((acc, schedule) => {
    acc[schedule.shift_type] = (acc[schedule.shift_type] || 0) + 1;
    return acc;
  }, {});

  // 按志工統計
  const byVolunteer = volunteers.map(volunteer => {
    const volunteerSchedules = schedules.filter(s => s.volunteer_id === volunteer.id);
    return {
      volunteer: volunteer.name,
      department: volunteer.department,
      count: volunteerSchedules.length,
      confirmed: volunteerSchedules.filter(s => s.status === 'confirmed').length
    };
  }).filter(v => v.count > 0);

  // 按狀態統計
  const byStatus = [
    { status: 'scheduled', label: '已排班', count: scheduledCount },
    { status: 'confirmed', label: '已確認', count: confirmedCount },
    { status: 'cancelled', label: '已取消', count: cancelledCount }
  ];

  // 計算百分比
  const getPercentage = (count, total) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        排班統計報表
      </Typography>

      {/* 總覽卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                總排班數
              </Typography>
              <Typography variant="h4" color="primary">
                {totalSchedules}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                所有排班總數
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                已確認
              </Typography>
              <Typography variant="h4" color="success.main">
                {confirmedCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {getPercentage(confirmedCount, totalSchedules)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                已排班
              </Typography>
              <Typography variant="h4" color="warning.main">
                {scheduledCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {getPercentage(scheduledCount, totalSchedules)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                已取消
              </Typography>
              <Typography variant="h4" color="error.main">
                {cancelledCount}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {getPercentage(cancelledCount, totalSchedules)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 狀態分布 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="狀態分布"
              subheader="排班狀態統計"
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>狀態</TableCell>
                      <TableCell align="right">數量</TableCell>
                      <TableCell align="right">比例</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byStatus.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={item.label}
                            color={item.status === 'confirmed' ? 'success' : 
                                  item.status === 'scheduled' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{item.count}</TableCell>
                        <TableCell align="right">
                          {getPercentage(item.count, totalSchedules)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 班別分布 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="班別分布"
              subheader="各班別排班數量"
            />
            <CardContent>
              <Stack spacing={2}>
                {Object.entries(byShiftType).map(([shift, count]) => (
                  <Box key={shift}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        {shift === 'morning' ? '上午班' : 
                         shift === 'afternoon' ? '下午班' : 
                         shift === 'evening' ? '晚上班' : 
                         shift === 'all_day' ? '全天班' : 
                         shift === 'night' ? '夜班' : shift}
                      </Typography>
                      <Typography variant="body2">{count} 次</Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                      <Box
                        sx={{
                          width: `${getPercentage(count, totalSchedules)}%`,
                          bgcolor: 'primary.main',
                          height: 8,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 志工排班統計 */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="志工排班統計"
              subheader="每位志工的排班數量"
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>志工姓名</TableCell>
                      <TableCell>部門</TableCell>
                      <TableCell align="right">總排班數</TableCell>
                      <TableCell align="right">已確認</TableCell>
                      <TableCell align="right">確認率</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byVolunteer.slice(0, 10).map((volunteer, index) => (
                      <TableRow key={index}>
                        <TableCell>{volunteer.volunteer}</TableCell>
                        <TableCell>{volunteer.department}</TableCell>
                        <TableCell align="right">{volunteer.count}</TableCell>
                        <TableCell align="right">{volunteer.confirmed}</TableCell>
                        <TableCell align="right">
                          {volunteer.count > 0 ? Math.round((volunteer.confirmed / volunteer.count) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScheduleStats;
