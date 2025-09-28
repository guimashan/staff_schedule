// backend/security/token.js
const jwt = require('jsonwebtoken');
const config = require('../config/security');

class TokenManager {
  // 生成存取令牌
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  // 生成刷新令牌
  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn
    });
  }

  // 驗證存取令牌
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('無效的存取令牌');
    }
  }

  // 驗證刷新令牌
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
      throw new Error('無效的刷新令牌');
    }
  }

  // 解碼令牌但不驗證
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  // 令牌過期時間檢查
  static isTokenExpired(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
}

module.exports = TokenManager;
