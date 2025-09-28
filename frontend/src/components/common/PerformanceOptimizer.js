// frontend/src/components/common/PerformanceOptimizer.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import performanceUtil from '../../utils/performance';

const PerformanceOptimizer = ({ children }) => {
  const [metrics, setMetrics] = useState(performanceUtil.getMetrics());
  const [loading, setLoading] = useState(false);
  const [performanceIssues, setPerformanceIssues] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceUtil.getMetrics());
      
      // 檢查效能問題
      const issues = [];
      if (performanceUtil.metrics.cacheHitRate < 70) {
        issues.push('快取命中率過低');
      }
      if (performanceUtil.metrics.networkRequests > 100) {
        issues.push('網路請求過多');
      }
      setPerformanceIssues(issues);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const performanceSummary = useMemo(() => {
    return {
      cacheHitRate: metrics.cacheHitRate?.toFixed(2) || 0,
      cacheSize: metrics.cacheSize || 0,
      networkRequests: metrics.networkRequests || 0,
      renderCount: metrics.renderCount || 0
    };
  }, [metrics]);

  return (
    <Box>
      {/* 效能警告 */}
      {performanceIssues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          效能問題: {performanceIssues.join(', ')}
        </Alert>
      )}

      {/* 效能指標卡片 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          效能指標
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  快取命中率
                </Typography>
                <Typography variant="h4" color="primary">
                  {performanceSummary.cacheHitRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  快取大小
                </Typography>
                <Typography variant="h4" color="success.main">
                  {performanceSummary.cacheSize}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  網路請求
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {performanceSummary.networkRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  渲染次數
                </Typography>
                <Typography variant="h4" color="info.main">
                  {performanceSummary.renderCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 效能優化建議 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          效能優化建議
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {performanceSummary.cacheHitRate < 70 && (
            <Chip label="增加快取策略" color="warning" />
          )}
          {performanceSummary.networkRequests > 50 && (
            <Chip label="減少API呼叫頻率" color="warning" />
          )}
          {performanceSummary.cacheSize > 100 && (
            <Chip label="清理快取資料" color="warning" />
          )}
          <Chip label="使用虛擬滾動" color="info" />
          <Chip label="圖片懶載入" color="info" />
          <Chip label="程式碼分割" color="info" />
        </Box>
      </Paper>

      {/* 子組件 */}
      {children}
    </Box>
  );
};

export default PerformanceOptimizer;
