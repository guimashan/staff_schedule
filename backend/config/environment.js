// backend/config/environment.js
const productionConfig = require('../../deploy/config/production');

class EnvironmentConfig {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test';
  }

  getConfig() {
    if (this.isProduction) {
      return productionConfig;
    }
    
    // 開發環境配置
    return {
      server: {
        port: process.env.PORT || 3001,
        host: '0.0.0.0',
        cors: {
          origin: '*',
          credentials: true
        }
      },
      database: {
        path: process.env.DB_PATH || './database.db',
        options: {
          verbose: console.log,
          timeout: 5000
        }
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'dev_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      },
      performance: {
        cache: {
          enabled: true,
          ttl: 300,
          max: 1000
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 100
        }
      },
      security: {
        cors: {
          origin: '*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true
        }
      }
    };
  }

  isProduction() {
    return this.isProduction;
  }

  isDevelopment() {
    return this.isDevelopment;
  }

  isTest() {
    return this.isTest;
  }
}

module.exports = new EnvironmentConfig();
