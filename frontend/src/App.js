// frontend/src/App.js
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const token = localStorage.getItem('token');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
