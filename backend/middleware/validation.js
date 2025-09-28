// backend/middleware/validation.js
const config = require('../config/security');

class ValidationMiddleware {
  // 驗證電子郵件格式
  static validateEmail(req, res, next) {
    const { email } = req.body;
    
    if (email && !config.validation.emailRegex.test(email)) {
      return res.status(400).json({ 
        message: '電子郵件格式不正確' 
      });
    }
    
    next();
  }

  // 驗證手機號碼格式
  static validatePhone(req, res, next) {
    const { phone } = req.body;
    
    if (phone && !config.validation.phoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: '手機號碼格式不正確 (應為09開頭的10位數字)' 
      });
    }
    
    next();
  }

  // 驗證密碼強度
  static validatePassword(req, res, next) {
    const { password } = req.body;
    
    if (password) {
      const passwordValidation = require('../security/password').validatePassword(password);
      
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: '密碼不符合要求',
          errors: passwordValidation.errors
        });
      }
    }
    
    next();
  }

  // 驗證志工資料
  static validateVolunteerData(req, res, next) {
    const { name, phone, email, department } = req.body;
    
    const errors = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('姓名不能為空');
    }
    
    if (!phone || phone.trim().length === 0) {
      errors.push('電話不能為空');
    } else if (!config.validation.phoneRegex.test(phone)) {
      errors.push('電話格式不正確');
    }
    
    if (!email || email.trim().length === 0) {
      errors.push('電子郵件不能為空');
    } else if (!config.validation.emailRegex.test(email)) {
      errors.push('電子郵件格式不正確');
    }
    
    if (!department || department.trim().length === 0) {
      errors.push('部門不能為空');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: '資料驗證失敗',
        errors 
      });
    }
    
    next();
  }

  // 驗證排班資料
  static validateScheduleData(req, res, next) {
    const { start_time, end_time, volunteer_id, shift_type } = req.body;
    
    const errors = [];
    
    if (!start_time) {
      errors.push('開始時間不能為空');
    } else if (isNaN(Date.parse(start_time))) {
      errors.push('開始時間格式不正確');
    }
    
    if (!end_time) {
      errors.push('結束時間不能為空');
    } else if (isNaN(Date.parse(end_time))) {
      errors.push('結束時間格式不正確');
    }
    
    if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
      errors.push('結束時間必須晚於開始時間');
    }
    
    if (!volunteer_id) {
      errors.push('志工ID不能為空');
    }
    
    if (!shift_type) {
      errors.push('班別不能為空');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: '排班資料驗證失敗',
        errors 
      });
    }
    
    next();
  }

  // 驗證通知資料
  static validateNotificationData(req, res, next) {
    const { title, content } = req.body;
    
    const errors = [];
    
    if (!title || title.trim().length === 0) {
      errors.push('通知標題不能為空');
    }
    
    if (!content || content.trim().length === 0) {
      errors.push('通知內容不能為空');
    }
    
    if (title && title.length > 200) {
      errors.push('通知標題不能超過200個字元');
    }
    
    if (content && content.length > 1000) {
      errors.push('通知內容不能超過1000個字元');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: '通知資料驗證失敗',
        errors 
      });
    }
    
    next();
  }

  // 驗證日期範圍
  static validateDateRange(req, res, next) {
    const { start_date, end_date } = req.query;
    
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          message: '日期格式不正確' 
        });
      }
      
      if (endDate < startDate) {
        return res.status(400).json({ 
          message: '結束日期不能早於開始日期' 
        });
      }
    }
    
    next();
  }

  // 驗證分頁參數
  static validatePagination(req, res, next) {
    const { page, limit } = req.query;
    
    if (page && (isNaN(page) || parseInt(page) < 1)) {
      return res.status(400).json({ 
        message: '頁碼必須為大於0的整數' 
      });
    }
    
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
      return res.status(400).json({ 
        message: '每頁數量必須為1-100之間的整數' 
      });
    }
    
    next();
  }

  // 驗證ID參數
  static validateIdParam(req, res, next) {
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({ 
        message: 'ID參數不正確' 
      });
    }
    
    next();
  }

  // 驗證批量操作
  static validateBulkOperation(req, res, next) {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        message: '批量操作ID列表不能為空' 
      });
    }
    
    if (ids.length > 100) {
      return res.status(400).json({ 
        message: '批量操作最多支援100個項目' 
      });
    }
    
    const invalidIds = ids.filter(id => isNaN(id) || parseInt(id) < 1);
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: '包含無效的ID', 
        invalidIds 
      });
    }
    
    next();
  }
}

module.exports = ValidationMiddleware;
