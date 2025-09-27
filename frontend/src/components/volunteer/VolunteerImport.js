// frontend/src/components/volunteer/VolunteerImport.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { Upload as UploadIcon, Download as DownloadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { volunteerAPI } from '../../services/api';

const VolunteerImport = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openPreview, setOpenPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 顯示通知
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 檢查檔案類型
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('請上傳CSV格式的檔案');
        return;
      }

      setFile(selectedFile);
      setError('');
      setSuccess('');
      
      // 預覽上傳的資料
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          if (lines.length < 2) {
            setError('CSV檔案格式不正確，至少需要標題列和一筆資料');
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] ? values[index].trim() : '';
            });
            return obj;
          });
          setPreviewData(data.slice(0, 5)); // 只顯示前5筆預覽
        } catch (err) {
          setError('檔案格式錯誤，請檢查CSV格式');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('請選擇要上傳的檔案');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      const response = await volunteerAPI.import(file);
      
      setSuccess(`成功導入 ${response.data.imported} 筆志工資料 (共 ${response.data.total} 筆)`);
      setFile(null);
      setPreviewData([]);
      showSnackbar(`成功導入 ${response.data.imported} 筆志工資料`);
    } catch (error) {
      console.error('導入失敗:', error);
      const errorMessage = error.response?.data?.message || '導入失敗，請稍後再試';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'name,phone,email,department,skills,experience_years,status',
      '張三,0912345678,zhang@example.com,接待服務,接待服務,2,active',
      '李四,0923456789,li@example.com,導覽解說,導覽解說,3,active',
      '王五,0934567890,wang@example.com,活動策劃,活動策劃,1,active'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '志工資料模板.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        志工資料批量導入
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            批量導入志工資料
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            請按照CSV模板格式準備志工資料，支援批量導入功能
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{ mr: 2 }}
            >
              下載CSV模板
            </Button>
          </Box>

          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="volunteer-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="volunteer-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              選擇CSV檔案
            </Button>
          </label>

          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              已選擇: {file.name}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ mt: 1 }}>
                上傳進度: {uploadProgress}%
              </Typography>
            </Box>
          )}

          {previewData.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setOpenPreview(true)}
              >
                預覽上傳資料
              </Button>
            </Box>
          )}

          {file && !uploading && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!file}
              >
                開始導入
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CSV格式說明 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            CSV格式說明
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            標題列必須包含以下欄位：
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip label="name (姓名)" size="small" variant="outlined" />
            <Chip label="phone (電話)" size="small" variant="outlined" />
            <Chip label="email (電子郵件)" size="small" variant="outlined" />
            <Chip label="department (部門)" size="small" variant="outlined" />
            <Chip label="skills (技能)" size="small" variant="outlined" />
            <Chip label="experience_years (經驗年數)" size="small" variant="outlined" />
            <Chip label="status (狀態)" size="small" variant="outlined" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            狀態選項: active (活躍), inactive (非活躍), pending (待審核)
          </Typography>
        </CardContent>
      </Card>

      {/* 預覽對話框 */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>上傳資料預覽</DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>姓名</TableCell>
                  <TableCell>電話</TableCell>
                  <TableCell>電子郵件</TableCell>
                  <TableCell>部門</TableCell>
                  <TableCell>技能</TableCell>
                  <TableCell>經驗年數</TableCell>
                  <TableCell>狀態</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.skills}</TableCell>
                    <TableCell>{row.experience_years}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            顯示前5筆資料，實際上傳將包含所有資料
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>關閉</Button>
        </DialogActions>
      </Dialog>

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
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default VolunteerImport;
