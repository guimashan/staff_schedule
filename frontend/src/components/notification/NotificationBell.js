// frontend/src/components/notification/NotificationBell.js
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
  Alert
} from '@mui/material';
import { Notifications as NotificationsIcon, Markunread as MarkUnreadIcon, MarkunreadMailbox as MarkReadIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { notificationAPI } from '../../services/api';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getUnread();
      setNotifications(response.data);
      setUnreadCount(response.data.length);
      setError('');
    } catch (error) {
      console.error('載入通知失敗:', error);
      setError('載入通知失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications([]);
      handleClose();
    } catch (error) {
      console.error('標記全部為已讀失敗:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('標記為已讀失敗:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'system':
        return <NotificationsIcon fontSize="small" />;
      case 'schedule':
        return <MarkUnreadIcon fontSize="small" />;
      case 'alert':
        return <MoreHorizIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
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

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          sx: { minWidth: 350, maxWidth: 400 }
        }}
      >
        <MenuItem>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            通知中心
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              全部標為已讀
            </Button>
          )}
        </MenuItem>
        
        <Divider />

        {error && (
          <MenuItem>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </MenuItem>
        )}

        {loading && (
          <MenuItem>
            <Typography variant="body2" sx={{ textAlign: 'center', width: '100%' }}>
              載入中...
            </Typography>
          </MenuItem>
        )}

        {!loading && !error && notifications.length === 0 && (
          <MenuItem>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
              沒有新通知
            </Typography>
          </MenuItem>
        )}

        {!loading && !error && notifications.length > 0 && (
          <List dense>
            {notifications.slice(0, 5).map((notification) => (
              <ListItem
                key={notification.id}
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => markAsRead(notification.id)}>
                    <MarkReadIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {getTypeIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleString('zh-TW')}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {notification.content.substring(0, 50)}...
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        <MenuItem onClick={() => { handleClose(); window.location.href = '/notifications'; }}>
          <Typography variant="body2" color="primary">
            查看全部通知
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationBell;
