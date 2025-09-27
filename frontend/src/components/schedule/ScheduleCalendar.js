// frontend/src/components/schedule/ScheduleCalendar.js
import React, { useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  Views
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack
} from '@mui/material';

const localizer = momentLocalizer(moment);

const ScheduleCalendar = ({ schedules, volunteers, onScheduleClick, onAddSchedule }) => {
  const [viewFilter, setViewFilter] = useState('all');

  // 將排班資料轉換為日曆事件格式
  const events = schedules
    .filter(schedule => {
      if (viewFilter === 'all') return true;
      if (viewFilter === 'active') return schedule.status !== 'cancelled';
      return schedule.status === viewFilter;
    })
    .map(schedule => ({
      id: schedule.id,
      title: `${schedule.volunteer_name || '未指定志工'} - ${getShiftLabel(schedule.shift_type)}`,
      start: new Date(schedule.start_time),
      end: new Date(schedule.end_time),
      resource: schedule
    }));

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

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    switch (event.resource.shift_type) {
      case 'morning':
        backgroundColor = '#4CAF50';
        borderColor = '#4CAF50';
        break;
      case 'afternoon':
        backgroundColor = '#2196F3';
        borderColor = '#2196F3';
        break;
      case 'evening':
        backgroundColor = '#FF9800';
        borderColor = '#FF9800';
        break;
      case 'night':
        backgroundColor = '#9C27B0';
        borderColor = '#9C27B0';
        break;
      case 'all_day':
        backgroundColor = '#607D8B';
        borderColor = '#607D8B';
        break;
      default:
        break;
    }

    if (event.resource.status === 'cancelled') {
      backgroundColor = '#9E9E9E';
      borderColor = '#9E9E9E';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '5px',
        opacity: 0.8,
        cursor: 'pointer',
        fontSize: '12px',
        padding: '2px 4px'
      },
    };
  };

  const customEvent = (event) => {
    return (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {event.title}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {new Date(event.start).toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>狀態過濾</InputLabel>
          <Select
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value)}
            label="狀態過濾"
          >
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="active">進行中</MenuItem>
            <MenuItem value="cancelled">已取消</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          size="small"
          onClick={onAddSchedule}
        >
          新增排班
        </Button>
      </Stack>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        components={{
          event: customEvent
        }}
        onSelectEvent={event => onScheduleClick(event.resource)}
        onSelectSlot={onAddSchedule}
        selectable
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        messages={{
          date: '日期',
          time: '時間',
          event: '事件',
          allDay: '全天',
          week: '週',
          work_week: '工作週',
          day: '日',
          month: '月',
          previous: '上一頁',
          next: '下一頁',
          today: '今天',
          agenda: '議程',
        }}
      />
    </Box>
  );
};

export default ScheduleCalendar;
