// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'backend/**/*.js',
    'frontend/src/**/*.js',
    '!backend/config/database.js',
    '!frontend/src/index.js',
    '!frontend/src/serviceWorker.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  testTimeout: 30000,
  verbose: true
};
