// tests/scripts/coverageReport.js
const fs = require('fs');
const path = require('path');

class CoverageReport {
  static async generate() {
    try {
      const coveragePath = path.join(__dirname, '../../coverage/coverage-final.json');
      const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

      const report = this.analyzeCoverage(coverageData);
      this.printReport(report);
      this.saveReport(report);
    } catch (error) {
      console.error('生成覆蓋率報告失敗:', error.message);
    }
  }

  static analyzeCoverage(coverageData) {
    const result = {
      total: 0,
      covered: 0,
      skipped: 0,
      files: []
    };

    for (const [filePath, fileData] of Object.entries(coverageData)) {
      const summary = fileData.s;
      const coveredLines = Object.values(summary).filter(count => count > 0).length;
      const totalLines = Object.keys(summary).length;
      
      const fileCoverage = {
        path: filePath,
        covered: coveredLines,
        total: totalLines,
        percentage: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0
      };

      result.covered += coveredLines;
      result.total += totalLines;
      result.files.push(fileCoverage);
    }

    result.overallPercentage = result.total > 0 ? 
      Math.round((result.covered / result.total) * 100) : 0;

    return result;
  }

  static printReport(report) {
    console.log('\n=== 測試覆蓋率報告 ===');
    console.log(`總行數: ${report.total}`);
    console.log(`覆蓋行數: ${report.covered}`);
    console.log(`覆蓋率: ${report.overallPercentage}%`);
    console.log('\n各檔案覆蓋率:');
    
    report.files.forEach(file => {
      console.log(`${file.percentage}% - ${file.path}`);
    });
  }

  static saveReport(report) {
    const reportPath = path.join(__dirname, '../../coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n覆蓋率報告已保存至: ${reportPath}`);
  }
}

module.exports = CoverageReport;
