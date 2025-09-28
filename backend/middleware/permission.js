// backend/middleware/permission.js
const db = require('../config/database');

class PermissionMiddleware {
  // 檢查志工資料權限
  static checkVolunteerPermission(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    const volunteerId = parseInt(req.params.id) || req.body.volunteer_id;
    
    // 管理員可以存取所有志工資料
    if (req.user.role === 'admin') {
      return next();
    }

    // 編輯者只能存取自己管理的志工
    if (req.user.role === 'editor') {
      db.get('SELECT * FROM volunteers WHERE id = ? AND manager_id = ?', [volunteerId, req.user.id], (err, volunteer) => {
        if (err) {
          return res.status(500).json({ message: '伺服器錯誤' });
        }
        
        if (!volunteer) {
          return res.status(403).json({ message: '沒有權限存取此志工資料' });
        }
        
        next();
      });
    } else {
      return res.status(403).json({ message: '沒有權限存取志工資料' });
    }
  }

  // 檢查排班權限
  static checkSchedulePermission(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    const scheduleId = parseInt(req.params.id);
    
    // 管理員可以存取所有排班
    if (req.user.role === 'admin') {
      return next();
    }

    // 編輯者只能存取自己相關的排班
    if (req.user.role === 'editor') {
      db.get('SELECT * FROM schedules WHERE id = ? AND created_by = ?', [scheduleId, req.user.id], (err, schedule) => {
        if (err) {
          return res.status(500).json({ message: '伺服器錯誤' });
        }
        
        if (!schedule) {
          return res.status(403).json({ message: '沒有權限存取此排班資料' });
        }
        
        next();
      });
    } else {
      return res.status(403).json({ message: '沒有權限存取排班資料' });
    }
  }

  // 檢查通知權限
  static checkNotificationPermission(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    const notificationId = parseInt(req.params.id);
    
    // 管理員可以存取所有通知
    if (req.user.role === 'admin') {
      return next();
    }

    // 用戶只能存取自己的通知
    if (req.user.role === 'user') {
      // 檢查是否為接收者或發送者
      db.get(`
        SELECT * FROM notifications 
        WHERE id = ? 
        AND (JSON_EXTRACT(recipient_ids, '$') LIKE ? OR sender_id = ?)
      `, [notificationId, `%${req.user.id}%`, req.user.id], (err, notification) => {
        if (err) {
          return res.status(500).json({ message: '伺服器錯誤' });
        }
        
        if (!notification) {
          return res.status(403).json({ message: '沒有權限存取此通知' });
        }
        
        next();
      });
    } else {
      return res.status(403).json({ message: '沒有權限存取通知' });
    }
  }

  // 檢查資料修改權限
  static checkDataModificationPermission(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    // 管理員可以修改所有資料
    if (req.user.role === 'admin') {
      return next();
    }

    // 編輯者只能修改特定類型的資料
    if (req.user.role === 'editor') {
      // 檢查是否是允許修改的資料類型
      const allowedModifications = [
        'volunteers', 'schedules', 'notifications'
      ];
      
      const urlPath = req.path;
      const isAllowed = allowedModifications.some(type => urlPath.includes(type));
      
      if (!isAllowed) {
        return res.status(403).json({ message: '沒有權限修改此類資料' });
      }
      
      next();
    } else {
      return res.status(403).json({ message: '沒有權限修改資料' });
    }
  }

  // 檢查API使用權限
  static checkAPIPermission(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '未授權' });
    }

    // 根據角色設定API使用限制
    const permissions = {
      admin: ['read', 'write', 'delete', 'export'],
      editor: ['read', 'write'],
      user: ['read']
    };

    const allowedActions = permissions[req.user.role] || [];
    
    // 檢查當前操作是否被允許
    const action = req.method.toLowerCase();
    if (!allowedActions.includes(action) && !allowedActions.includes('write')) {
      return res.status(403).json({ 
        message: `角色 ${req.user.role} 沒有權限執行此操作` 
      });
    }

    next();
  }
}

module.exports = PermissionMiddleware;
