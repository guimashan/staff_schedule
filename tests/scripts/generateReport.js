// tests/scripts/generateReport.js
const fs = require('fs');
const path = require('path');

class TestReportGenerator {
  constructor() {
    this.results = [];
  }

  addResult(testName, status, duration, error = null) {
    this.results.push({
      name: testName,
      status,
      duration,
      error,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        skipped: this.results.filter(r => r.status === 'skipped').length,
        duration: this.results.reduce((sum, r) => sum + r.duration, 0)
      },
      tests: this.results
    };

    const reportPath = path.join(__dirname, '../../test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('測試報告已生成:', reportPath);
    return report;
  }

  generateHTMLReport() {
    const report = this.generateReport();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>測試報告 - 龜馬山志工排班系統</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test { border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px; }
        .passed { border-left: 5px solid #4CAF50; }
        .failed { border-left: 5px solid #f44336; }
        .skipped { border-left: 5px solid #ff9800; }
        .error { color: #f44336; background: #ffebee; padding: 5px; margin-top: 5px; }
    </style>
</head>
<body>
    <h1>測試報告 - 龜馬山志工排班系統</h1>
    
    <div class="summary">
        <h2>測試摘要</h2>
        <p>總測試數: ${report.summary.total}</p>
        <p>通過: ${report.summary.passed}</p>
        <p>失敗: ${report.summary.failed}</p>
        <p>跳過: ${report.summary.skipped}</p>
        <p>總耗時: ${(report.summary.duration / 1000).toFixed(2)} 秒</p>
    </div>

    <h2>測試結果</h2>
    ${report.tests.map(test => `
        <div class="test ${test.status}">
            <h3>${test.name}</h3>
            <p>狀態: ${test.status}</p>
            <p>耗時: ${test.duration}ms</p>
            <p>時間: ${test.timestamp}</p>
            ${test.error ? `<div class="error">錯誤: ${test.error}</div>` : ''}
        </div>
    `).join('')}
</body>
</html>
    `;

    const htmlPath = path.join(__dirname, '../../test-report.html');
    fs.writeFileSync(htmlPath, html);
    
    console.log('HTML測試報告已生成:', htmlPath);
  }
}

module.exports = TestReportGenerator;
