// frontend/src/components/report/ChartContainer.js
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';

const ChartContainer = ({ title, children, loading, error }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2, height: 300 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: 300 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography color="error">
          載入失敗: {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartContainer;
