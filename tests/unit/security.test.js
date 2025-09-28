// tests/unit/security.test.js
const PasswordSecurity = require('../../backend/security/password');
const TokenManager = require('../../backend/security/token');

describe('安全功能測試', () => {
  test('密碼強度驗證', () => {
    // 強密碼測試
    const strongPassword = 'StrongPass123!';
    const strongValidation = PasswordSecurity.validatePassword(strongPassword);
    expect(strongValidation.isValid).toBe(true);

    // 弱密碼測試
    const weakPassword = 'weak';
    const weakValidation = PasswordSecurity.validatePassword(weakPassword);
    expect(weakValidation.isValid).toBe(false);
    expect(weakValidation.errors.length).toBeGreaterThan(0);
  });

  test('密碼加密和驗證', async () => {
    const password = 'TestPassword123!';
    const hashed = await PasswordSecurity.hashPassword(password);
    
    expect(hashed).not.toBe(password);
    
    const isValid = await PasswordSecurity.verifyPassword(password, hashed);
    expect(isValid).toBe(true);
    
    const isInvalid = await PasswordSecurity.verifyPassword('WrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });

  test('JWT令牌生成和驗證', () => {
    const payload = { id: 1, email: 'test@example.com' };
    
    const token = TokenManager.generateAccessToken(payload);
    expect(typeof token).toBe('string');
    
    const decoded = TokenManager.verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  test('令牌過期檢查', () => {
    // 生成一個立即過期的令牌
    const expiredToken = TokenManager.generateAccessToken({ id: 1 }, { expiresIn: '0s' });
    
    const isExpired = TokenManager.isTokenExpired(expiredToken);
    expect(isExpired).toBe(true);
  });

  test('密碼過期檢查', () => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000); // 91天前
    
    const isExpired = PasswordSecurity.isPasswordExpired(ninetyDaysAgo.toISOString());
    expect(isExpired).toBe(true);
    
    const isNotExpired = PasswordSecurity.isPasswordExpired(now.toISOString());
    expect(isNotExpired).toBe(false);
  });
});
