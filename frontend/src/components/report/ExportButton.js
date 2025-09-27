// frontend/src/components/report/ExportButton.js
import React from 'react';
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { Download as DownloadIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { reportAPI } from '../../services/api';

const ExportButton = ({ onExport, title = "匯出" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      await reportAPI.export(format);
      if (onExport) onExport(format);
    } catch (error) {
      console.error('匯出失敗:', error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? '匯出中...' : title}
      </Button>
      
      {loading && <LinearProgress sx={{ mt: 1 }} />}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          匯出PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          匯出Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          匯出CSV
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExportButton;
