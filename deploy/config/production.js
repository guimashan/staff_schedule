// deploy/config/production.js
module.exports = {
  // 伺服器配置
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://your-domain.com',
      credentials: true
    }
  },

  // 資料庫配置
  database: {
    path: process.env.DB_PATH || './database.db',
    options: {
      verbose: console.log,
      timeout: 30000
    }
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Redis快取配置
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0
  },

  // 日誌配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    file: {
      filename: './logs/app.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }
  },

  // 效能配置
  performance: {
    cache: {
      enabled: true,
      ttl: 300, // 5分鐘
      max: 1000
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分鐘
      max: 100
    }
  },

  // 安全配置
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.example.com"]
        }
      }
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://your-domain.com',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  },

  // 郵件配置 (如果需要)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },

  // 監控配置
  monitoring: {
    enabled: true,
    metrics: {
      collectDefault: true,
      endpoint: '/metrics'
    },
    alerts: {
      enabled: true,
      threshold: 80 // 百分比
    }
  }
};
