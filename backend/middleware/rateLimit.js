// backend/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const config = require('../config/security');

class RateLimitMiddleware {
  // API速率限制
  static apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      error: 'TOO_MANY_REQUESTS',
      message: config.rateLimit.message,
      retryAfter: '15分鐘'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 登入速率限制
  static loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 5, // 限制每個IP 15分鐘內最多5次登入嘗試
    message: {
      error: 'LOGIN_ATTEMPTS_EXCEEDED',
      message: '登入嘗試次數過多，請15分鐘後再試'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 註冊速率限制
  static registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小時
    max: 3, // 限制每個IP 1小時內最多3次註冊
    message: {
      error: 'REGISTRATION_ATTEMPTS_EXCEEDED',
      message: '註冊次數過多，請1小時後再試'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 檢查速率限制狀態
  static checkRateLimitStatus(req, res, next) {
    const windowMs = config.rateLimit.windowMs;
    const max = config.rateLimit.max;
    const current = req.rateLimit.current;
    const remaining = req.rateLimit.remaining;

    // 設定速率限制頭部
    res.set('X-RateLimit-Limit', max);
    res.set('X-RateLimit-Remaining', remaining);
    res.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

    next();
  }

  // 自定義速率限制器
  static createCustomLimiter(options) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 100,
      message: options.message || '請求過於頻繁',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // 特定端點速率限制
  static getVolunteerListLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 50, // 限制每個IP 15分鐘內最多50次查詢志工列表
    message: '查詢志工列表次數過多，請稍後再試',
    standardHeaders: true,
    legacyHeaders: false,
  });

  static getScheduleListLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 50, // 限制每個IP 15分鐘內最多50次查詢排班列表
    message: '查詢排班列表次數過多，請稍後再試',
    standardHeaders: true,
    legacyHeaders: false,
  });

  static exportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小時
    max: 10, // 限制每個IP 1小時內最多10次匯出操作
    message: '匯出次數過多，請1小時後再試',
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = RateLimitMiddleware;
