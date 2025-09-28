// frontend/src/App.js (更新後)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/common/Layout';
import VolunteerList from './components/volunteer/VolunteerList';
import VolunteerStats from './components/volunteer/VolunteerStats';
import VolunteerImport from './components/volunteer/VolunteerImport';
import ScheduleManager from './components/schedule/ScheduleManager';
import NotificationManager from './components/notification/NotificationManager';
import ReportManager from './components/report/ReportManager';
import PerformanceOptimizer from './components/common/PerformanceOptimizer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        '*, *::before, *::after': {
          boxSizing: 'inherit',
        },
      },
    },
  },
});

function App() {
  const token = localStorage.getItem('token');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PerformanceOptimizer>
        <Router>
          <Box sx={{ minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={!token ? <LoginForm /> : <Navigate to="/dashboard" />} />
              <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
                <Route path="dashboard" element={<ScheduleManager />} />
                <Route path="volunteers" element={<VolunteerList />} />
                <Route path="volunteers/stats" element={<VolunteerStats />} />
                <Route path="volunteers/import" element={<VolunteerImport />} />
                <Route path="schedules" element={<ScheduleManager />} />
                <Route path="notifications" element={<NotificationManager />} />
                <Route path="reports" element={<ReportManager />} />
              </Route>
            </Routes>
          </Box>
        </Router>
      </PerformanceOptimizer>
    </ThemeProvider>
  );
}

export default App;
