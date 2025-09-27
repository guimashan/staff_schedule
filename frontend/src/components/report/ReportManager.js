// frontend/src/components/report/ReportManager.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  Stack
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import ReportDashboard from './ReportDashboard';
import VolunteerReport from './VolunteerReport';
import ScheduleReport from './ScheduleReport';
import AttendanceReport from './AttendanceReport';
import { reportAPI } from '../../services/api';

const ReportManager = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // 顯示通知
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 獲取報告列表
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getAll();
      setReports(response.data);
      setError('');
    } catch (error) {
      console.error('載入報告失敗:', error);
      setError('載入報告失敗，請稍後再試');
      showSnackbar('載入報告失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenDialog = (report = null) => {
    setCurrentReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentReport(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePrint = () => {
    window.print();
    showSnackbar('正在列印...');
  };

  const handleExport = async (format) => {
    try {
      await reportAPI.export(format);
      showSnackbar(`已匯出為 ${format} 格式`);
    } catch (error) {
      console.error('匯出失敗:', error);
      showSnackbar('匯出失敗，請稍後再試', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>載入中...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchReports}>
          重新載入
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4">報告與統計</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            列印
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            匯出PDF
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            匯出Excel
          </Button>
        </Stack>
      </Box>

      {/* 標籤頁 */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="總覽面板" />
        <Tab label="志工報告" />
        <Tab label="排班報告" />
        <Tab label="出勤報告" />
      </Tabs>

      {/* 標籤頁內容 */}
      {activeTab === 0 && <ReportDashboard />}
      {activeTab === 1 && <VolunteerReport />}
      {activeTab === 2 && <ScheduleReport />}
      {activeTab === 3 && <AttendanceReport />}

      {/* 通知欄 */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ReportManager;
