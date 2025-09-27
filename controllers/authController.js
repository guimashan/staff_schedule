const { pool } = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

// 登錄
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 檢查輸入
        if (!username || !password) {
            return res.status(400).json({ error: '請輸入帳號和密碼' });
        }

        // 查找用戶
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: '帳號或密碼錯誤' });
        }

        const user = users[0];

        // 驗證密碼
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: '帳號或密碼錯誤' });
        }

        // 生成 token
        const token = generateToken(user.id, user.role);

        // 回傳用戶資訊（不包含密碼）
        const { password: _, ...userInfo } = user;
        res.json({
            message: '登錄成功',
            token,
            user: userInfo
        });

    } catch (error) {
        console.error('登錄錯誤：', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
};

// 獲取用戶資訊
const getUserInfo = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await pool.execute(
            'SELECT id, username, name, role, group_id, phone, line_id, email, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '用戶不存在' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('獲取用戶資訊錯誤：', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
};

module.exports = {
    login,
    getUserInfo
};
