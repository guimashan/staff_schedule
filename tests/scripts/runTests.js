// tests/scripts/runTests.js
const { spawn } = require('child_process');
const path = require('path');

class TestRunner {
  async runUnitTests() {
    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', 'tests/unit', '--verbose'], {
        cwd: path.join(__dirname, '../..'),
        stdio: 'inherit'
      });

      jest.on('close', (code) => {
        if (code === 0) {
          console.log('單元測試執行完成');
          resolve();
        } else {
          console.log('單元測試執行失敗');
          reject(new Error('單元測試失敗'));
        }
      });
    });
  }

  async runIntegrationTests() {
    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', 'tests/integration', '--verbose'], {
        cwd: path.join(__dirname, '../..'),
        stdio: 'inherit'
      });

      jest.on('close', (code) => {
        if (code === 0) {
          console.log('整合測試執行完成');
          resolve();
        } else {
          console.log('整合測試執行失敗');
          reject(new Error('整合測試失敗'));
        }
      });
    });
  }

  async runAllTests() {
    try {
      console.log('開始執行單元測試...');
      await this.runUnitTests();
      
      console.log('開始執行整合測試...');
      await this.runIntegrationTests();
      
      console.log('所有測試執行完成！');
    } catch (error) {
      console.error('測試執行失敗:', error.message);
      process.exit(1);
    }
  }
}

const runner = new TestRunner();
runner.runAllTests();
