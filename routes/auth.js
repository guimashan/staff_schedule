const express = require('express');
const { login, getUserInfo } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 登錄路由（不需要認證）
router.post('/login', login);

// 獲取用戶資訊路由（需要認證）
router.get('/me', authenticateToken, getUserInfo);

module.exports = router;
