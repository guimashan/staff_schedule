// backend/routes/auth.js (更新後)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TokenManager = require('../security/token');
const PasswordSecurity = require('../security/password');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');
const RateLimitMiddleware = require('../middleware/rateLimit');

// 註冊
router.post('/register', 
  RateLimitMiddleware.registerLimiter,
  ValidationMiddleware.validateEmail,
  ValidationMiddleware.validatePassword,
  ValidationMiddleware.validateVolunteerData,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // 檢查用戶是否已存在
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: '該電子郵件已被註冊' 
        });
      }
      
      // 創建新用戶
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user'
      });
      
      // 生成令牌
      const accessToken = TokenManager.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      const refreshToken = TokenManager.generateRefreshToken({
        id: user.id,
        email: user.email
      });
      
      res.status(201).json({
        message: '註冊成功',
        user: user.toJSON(),
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ 
        message: error.message 
      });
    }
  }
);

// 登入
router.post('/login', 
  RateLimitMiddleware.loginLimiter,
  ValidationMiddleware.validateEmail,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // 驗證用戶憑證
      const user = await User.authenticate(email, password);
      
      // 生成令牌
      const accessToken = TokenManager.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      const refreshToken = TokenManager.generateRefreshToken({
        id: user.id,
        email: user.email
      });
      
      res.json({
        message: '登入成功',
        user: user.toJSON(),
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(401).json({ 
        message: error.message 
      });
    }
  }
);

// 刷新令牌
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: '未提供刷新令牌' });
    }
    
    const decoded = TokenManager.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: '用戶不存在' });
    }
    
    const newAccessToken = TokenManager.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// 變更密碼
router.put('/change-password', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validatePassword,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      // 驗證當前密碼
      const user = await User.findById(userId);
      const isValidCurrentPassword = await PasswordSecurity.verifyPassword(
        currentPassword, 
        user.password
      );
      
      if (!isValidCurrentPassword) {
        return res.status(400).json({ message: '當前密碼錯誤' });
      }
      
      // 更新密碼
      const updatedUser = await User.update(userId, { password: newPassword });
      
      res.json({
        message: '密碼變更成功',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 重設密碼（通過電子郵件）
router.post('/reset-password', 
  RateLimitMiddleware.apiLimiter,
  ValidationMiddleware.validateEmail,
  async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }
      
      // 生成重設密碼令牌
      const resetToken = TokenManager.generateAccessToken({
        id: user.id,
        email: user.email,
        action: 'reset_password'
      });
      
      // 這裡應該發送重設密碼郵件
      // 實際應用中需要設定郵件服務
      
      res.json({
        message: '重設密碼郵件已發送',
        resetToken
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 獲取用戶資料
router.get('/profile', 
  AuthMiddleware.authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }
      
      res.json({
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 更新用戶資料
router.put('/profile', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateEmail,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = { ...req.body };
      
      // 不允許更新某些欄位
      delete updateData.id;
      delete updateData.password;
      delete updateData.role;
      delete updateData.created_at;
      delete updateData.updated_at;
      
      const updatedUser = await User.update(userId, updateData);
      
      res.json({
        message: '個人資料更新成功',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 登出
router.post('/logout', 
  AuthMiddleware.authenticate,
  async (req, res) => {
    try {
      // 在實際應用中，可能需要將令牌加入黑名單
      res.json({
        message: '登出成功'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
