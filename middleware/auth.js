const { verifyToken } = require('../utils/auth');

// 驗證 token 的中介層
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 取得 Bearer token

    if (!token) {
        return res.status(401).json({ error: '需要認證' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: '無效的 token' });
    }
};

module.exports = {
    authenticateToken
};
