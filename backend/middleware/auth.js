// backend/middleware/auth.js
const TokenManager = require('../security/token');
const db = require('../config/database');

class AuthMiddleware {
  // JWT身份驗證
  static authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: '未提供存取令牌' 
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = TokenManager.verifyAccessToken(token);
      
      // 檢查用戶是否仍然有效
      db.get('SELECT * FROM users WHERE id = ? AND status = ?', [decoded.id, 'active'], (err, user) => {
        if (err) {
          return res.status(500).json({ message: '伺服器錯誤' });
        }
        
        if (!user) {
          return res.status(401).json({ message: '用戶不存在或已被停用' });
        }

        req.user = decoded;
        req.user.dbUser = user;
        next();
      });
    } catch (error) {
      return res.status(401).json({ 
        message: error.message 
      });
    }
  }

  // 管理員驗證
  static requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理員權限' });
    }

    next();
  }

  // 指定角色驗證
  static requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: '未授權' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `需要 ${roles.join(' 或 ')} 權限` 
        });
      }

      next();
    };
  }

  // 用戶本人驗證
  static requireSelfOrAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    const userId = parseInt(req.params.id) || req.body.id || req.query.id;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '只能操作自己的資料或需要管理員權限' });
    }

    next();
  }

  // 驗證令牌有效性
  static validateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供存取令牌' });
    }

    const token = authHeader.substring(7);
    
    if (TokenManager.isTokenExpired(token)) {
      return res.status(401).json({ message: '令牌已過期' });
    }

    next();
  }
}

module.exports = AuthMiddleware;
