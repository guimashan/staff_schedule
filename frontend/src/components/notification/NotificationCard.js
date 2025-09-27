// frontend/src/components/notification/NotificationCard.js
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  Button
} from '@mui/material';
import { MarkunreadMailbox as MarkReadIcon, Delete as DeleteIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

const NotificationCard = ({ notification, onMarkRead, onDelete, onView }) => {
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
    <Card 
      sx={{ 
        mb: 2,
        backgroundColor: notification.is_read ? 'inherit' : 'action.selected'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="div">
                {notification.title}
              </Typography>
              <Chip
                label={getTypeLabel(notification.type)}
                color={getTypeColor(notification.type)}
                size="small"
                variant="outlined"
              />
              {!notification.is_read && (
                <Chip
                  label="未讀"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {new Date(notification.created_at).toLocaleString('zh-TW')}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {notification.content}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                startIcon={<OpenInNewIcon />}
                onClick={() => onView && onView(notification)}
              >
                詳細資訊
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {!notification.is_read && (
              <IconButton 
                size="small" 
                onClick={() => onMarkRead && onMarkRead(notification.id)}
              >
                <MarkReadIcon />
              </IconButton>
            )}
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete && onDelete(notification.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
