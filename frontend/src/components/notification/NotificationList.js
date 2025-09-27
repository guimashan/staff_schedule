// frontend/src/components/notification/NotificationList.js
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
  Pagination,
  Checkbox,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Markunread as MarkUnreadIcon, MarkunreadMailbox as MarkReadIcon } from '@mui/icons-material';

const NotificationList = ({ notifications, onEdit, onDelete, onMarkRead }) => {
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // 過濾通知資料
  React.useEffect(() => {
    let filtered = notifications;

    // 搜索過濾
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 狀態過濾
    if (statusFilter) {
      if (statusFilter === 'read') {
        filtered = filtered.filter(notification => notification.is_read);
      } else if (statusFilter === 'unread') {
        filtered = filtered.filter(notification => !notification.is_read);
      }
    }

    // 類型過濾
    if (typeFilter) {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // 只顯示未讀
    if (showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.is_read);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, statusFilter, typeFilter, showUnreadOnly]);

  // 獲取當前頁面的資料
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredNotifications.slice(startIndex, endIndex);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'system':
        return 'primary';
      case 'schedule':
        return 'success';
      case 'alert':
        return 'error';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      default:
        return 'default';
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
          label="搜尋通知"
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
            <MenuItem value="unread">未讀</MenuItem>
            <MenuItem value="read">已讀</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>類型</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="類型"
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="system">系統通知</MenuItem>
            <MenuItem value="schedule">排班通知</MenuItem>
            <MenuItem value="alert">警示通知</MenuItem>
            <MenuItem value="info">資訊通知</MenuItem>
            <MenuItem value="warning">警告通知</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
          }
          label="只顯示未讀"
        />
      </Box>

      {/* 通知列表表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>標題</TableCell>
              <TableCell>發送者</TableCell>
              <TableCell>類型</TableCell>
              <TableCell>發送時間</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>內容</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageData().map((notification) => (
              <TableRow 
                key={notification.id}
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  backgroundColor: !notification.is_read ? 'action.selected' : 'inherit'
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {notification.title}
                  </Typography>
                </TableCell>
                <TableCell>{notification.sender_name}</TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(notification.type)}
                    color={getTypeColor(notification.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(notification.created_at).toLocaleString('zh-TW')}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox
                      checked={notification.is_read}
                      onChange={() => onMarkRead(notification.id)}
                      size="small"
                    />
                    <Typography variant="body2">
                      {notification.is_read ? '已讀' : '未讀'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" noWrap>
                    {notification.content.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="編輯">
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(notification)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => onDelete(notification.id)}
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
      {filteredNotifications.length > rowsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3,
          alignItems: 'center'
        }}>
          <Pagination
            count={Math.ceil(filteredNotifications.length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
          <Typography sx={{ ml: 2 }}>
            顯示 {Math.min((page - 1) * rowsPerPage + 1, filteredNotifications.length)} - {Math.min(page * rowsPerPage, filteredNotifications.length)} / {filteredNotifications.length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NotificationList;
