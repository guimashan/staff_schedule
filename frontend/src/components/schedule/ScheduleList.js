// frontend/src/components/schedule/ScheduleList.js
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Pagination
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ScheduleList = ({ schedules, volunteers, onEdit, onDelete }) => {
  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 過濾排班資料
  React.useEffect(() => {
    let filtered = schedules;

    // 搜索過濾
    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        (schedule.volunteer_name && schedule.volunteer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.location && schedule.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 狀態過濾
    if (statusFilter) {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    // 班別過濾
    if (shiftFilter) {
      filtered = filtered.filter(schedule => schedule.shift_type === shiftFilter);
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchTerm, statusFilter, shiftFilter]);

  // 獲取當前頁面的資料
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredSchedules.slice(startIndex, endIndex);
  };

  const getVolunteerName = (volunteerId) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    return volunteer ? volunteer.name : '未指定';
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
      case 'scheduled':
        return 'primary';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled':
        return '已排班';
      case 'confirmed':
        return '已確認';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

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
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>狀態</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
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
      </Box>

      {/* 排班列表表格 */}
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
              <TableCell>備註</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {getVolunteerName(schedule.volunteer_id)}
                  </Typography>
                </TableCell>
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
                  <Typography variant="caption" noWrap>
                    {schedule.notes || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="編輯">
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(schedule)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => onDelete(schedule.id)}
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
      {filteredSchedules.length > rowsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3,
          alignItems: 'center'
        }}>
          <Pagination
            count={Math.ceil(filteredSchedules.length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
          <Typography sx={{ ml: 2 }}>
            顯示 {Math.min((page - 1) * rowsPerPage + 1, filteredSchedules.length)} - {Math.min(page * rowsPerPage, filteredSchedules.length)} / {filteredSchedules.length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ScheduleList;
