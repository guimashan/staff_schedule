// backend/security/password.js
const bcrypt = require('bcryptjs');
const config = require('../config/security');

class PasswordSecurity {
  // 驗證密碼強度
  static validatePassword(password) {
    const errors = [];
    
    if (password.length < config.password.minLength) {
      errors.push(`密碼長度至少需要 ${config.password.minLength} 位`);
    }
    
    if (config.password.requireNumbers && !/\d/.test(password)) {
      errors.push('密碼必須包含數字');
    }
    
    if (config.password.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
      errors.push('密碼必須包含特殊字符 (@$!%*?&)');
    }
    
    if (config.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密碼必須包含大寫字母');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 加密密碼
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // 驗證密碼
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 生成隨機密碼
  static generateRandomPassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 檢查密碼是否過期
  static isPasswordExpired(passwordChangedAt, maxAgeDays = config.password.maxAge) {
    if (!passwordChangedAt) return false;
    
    const passwordChanged = new Date(passwordChangedAt);
    const now = new Date();
    const daysSinceChange = Math.floor((now - passwordChanged) / (1000 * 60 * 60 * 24));
    
    return daysSinceChange > maxAgeDays;
  }
}

module.exports = PasswordSecurity;
