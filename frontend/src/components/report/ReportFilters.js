// frontend/src/components/report/ReportFilters.js
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Stack
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ReportFilters = ({ filters, onFilterChange, dateRange = false }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 3, 
      flexWrap: 'wrap',
      alignItems: 'flex-end'
    }}>
      <TextField
        label="搜尋"
        value={filters.search || ''}
        onChange={(e) => onFilterChange('search', e.target.value)}
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
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          label="狀態"
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="active">活躍</MenuItem>
          <MenuItem value="inactive">非活躍</MenuItem>
          <MenuItem value="pending">待審核</MenuItem>
        </Select>
      </FormControl>

      {dateRange && (
        <Stack direction="row" spacing={2}>
          <TextField
            label="開始日期"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="結束日期"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

export default ReportFilters;
