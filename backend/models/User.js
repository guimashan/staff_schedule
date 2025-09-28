// backend/models/User.js
const db = require('../config/database');
const PasswordSecurity = require('../security/password');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || 'user';
    this.status = userData.status || 'active';
    this.last_login = userData.last_login;
    this.password_changed_at = userData.password_changed_at;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // 創建新用戶
  static async create(userData) {
    try {
      const hashedPassword = await PasswordSecurity.hashPassword(userData.password);
      
      const result = await db.run(`
        INSERT INTO users (name, email, password, role, status, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [
        userData.name,
        userData.email,
        hashedPassword,
        userData.role || 'user',
        userData.status || 'active'
      ]);
      
      const user = await this.findById(result.lastID);
      return user;
    } catch (error) {
      throw new Error(`創建用戶失敗: ${error.message}`);
    }
  }

  // 根據ID查找用戶
  static async findById(id) {
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
      return user ? new User(user) : null;
    } catch (error) {
      throw new Error(`查找用戶失敗: ${error.message}`);
    }
  }

  // 根據電子郵件查找用戶
  static async findByEmail(email) {
    try {
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      return user ? new User(user) : null;
    } catch (error) {
      throw new Error(`查找用戶失敗: ${error.message}`);
    }
  }

  // 驗證用戶憑證
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      
      if (!user) {
        throw new Error('用戶不存在');
      }
      
      if (user.status !== 'active') {
        throw new Error('用戶帳號已被停用');
      }
      
      const isValidPassword = await PasswordSecurity.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('密碼錯誤');
      }
      
      // 檢查密碼是否過期
      if (PasswordSecurity.isPasswordExpired(user.password_changed_at)) {
        throw new Error('密碼已過期，請重設密碼');
      }
      
      // 更新最後登入時間
      await db.run('UPDATE users SET last_login = datetime("now") WHERE id = ?', [user.id]);
      
      return new User(user);
    } catch (error) {
      throw new Error(`用戶驗證失敗: ${error.message}`);
    }
  }

  // 更新用戶資料
  static async update(id, updateData) {
    try {
      const updates = [];
      const params = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'id' && key !== 'created_at') {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }
      
      if (updateData.password) {
        const hashedPassword = await PasswordSecurity.hashPassword(updateData.password);
        updates.push('password = ?', 'password_changed_at = datetime("now")');
        params.push(hashedPassword);
      }
      
      updates.push('updated_at = datetime("now")');
      params.push(id);
      
      await db.run(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`更新用戶失敗: ${error.message}`);
    }
  }

  // 刪除用戶
  static async delete(id) {
    try {
      await db.run('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`刪除用戶失敗: ${error.message}`);
    }
  }

  // 獲取所有用戶
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      
      if (filters.role) {
        query += ' AND role = ?';
        params.push(filters.role);
      }
      
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const users = await db.all(query, params);
      return users.map(user => new User(user));
    } catch (error) {
      throw new Error(`獲取用戶列表失敗: ${error.message}`);
    }
  }

  // 檢查用戶角色
  hasRole(role) {
    return this.role === role;
  }

  // 檢查用戶權限
  hasPermission(permission) {
    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users'],
      editor: ['read', 'write'],
      user: ['read']
    };
    
    return permissions[this.role]?.includes(permission) || false;
  }

  // 驗證密碼強度
  validatePassword(password) {
    return PasswordSecurity.validatePassword(password);
  }

  // 轉換為JSON格式（移除敏感資訊）
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status,
      last_login: this.last_login,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;
