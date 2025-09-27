const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 加密密碼
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// 驗證密碼
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// 生成 JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// 驗證 JWT token
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};
