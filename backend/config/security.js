// backend/config/security.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const securityConfig = {
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'guimashan_secret_key_2023',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'guimashan_refresh_secret_2023',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // 密碼配置
  password: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
    maxAge: 90 // 密碼有效期90天
  },
  
  // 速率限制配置
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 限制每個IP 15分鐘內最多100次請求
    message: '請求過於頻繁，請稍後再試'
  },
  
  // 安全頭配置
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },
  
  // 驗證規則
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneRegex: /^09\d{8}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  }
};

module.exports = securityConfig;
