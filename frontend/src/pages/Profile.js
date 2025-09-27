import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    group_name: '',
    phone: '',
    line_id: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // 獲取用戶資訊
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('https://您的-render-url.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const userData = response.data;
        setUser(userData);
        
        // 設定表單初始值
        setFormData({
          name: userData.name || '',
          group_name: getGroupName(userData.group_id) || '',
          phone: userData.phone || '',
          line_id: userData.line_id || '',
          email: userData.email || '',
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } catch (error) {
        setError('無法獲取用戶資訊');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // 根據組別ID獲取組別名稱
  const getGroupName = (groupId) => {
    const groups = {
      1: '神務組',
      2: '活動組', 
      3: '誦經組',
      4: '辦公室'
    };
    return groups[groupId] || '未分配';
  };

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 處理表單送出
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // 驗證密碼變更
      if (formData.new_password || formData.confirm_password || formData.current_password) {
        if (!formData.current_password) {
          throw new Error('請輸入目前密碼');
        }
        if (formData.new_password !== formData.confirm_password) {
          throw new Error('新密碼與確認密碼不一致');
        }
        if (formData.new_password.length < 4) {
          throw new Error('密碼長度至少4位');
        }
      }

      // 準備要更新的資料
      const updateData = {
        phone: formData.phone,
        line_id: formData.line_id,
        email: formData.email
      };

      // 如果有密碼變更，也加入更新資料
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const token = localStorage.getItem('token');
      // 這裡會呼叫實際的 API 來更新用戶資料
      // await axios.put('https://您的-render-url.onrender.com/api/users/profile', updateData, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      // 模擬 API 呼叫成功
      setSuccess('資料更新成功！');
      
      // 如果變更了密碼，自動登出
      if (formData.new_password) {
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('密碼已變更，請重新登錄');
          navigate('/');
        }, 2000);
      }

    } catch (error) {
      setError(error.response?.data?.error || error.message || '更新失敗');
    } finally {
      setSaving(false);
    }
  };

  // 處理取消
  const handleCancel = () => {
    // 重置表單到原始狀態
    if (user) {
      setFormData({
        name: user.name || '',
        group_name: getGroupName(user.group_id) || '',
        phone: user.phone || '',
        line_id: user.line_id || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div>載入中...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>個人資料</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* 基本資訊 */}
                <Form.Group className="mb-3">
                  <Form.Label>姓名</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    姓名由管理員設定，無法修改
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>組別</Form.Label>
                  <Form.Control
                    type="text"
                    name="group_name"
                    value={formData.group_name}
                    onChange={handleInputChange}
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    組別由管理員設定，無法修改
                  </Form.Text>
                </Form.Group>

                {/* 聯絡資訊 */}
                <Form.Group className="mb-3">
                  <Form.Label>手機號碼 *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="請輸入手機號碼"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Line ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="line_id"
                    value={formData.line_id}
                    onChange={handleInputChange}
                    placeholder="請輸入 Line ID"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="請輸入 Email"
                    required
                  />
                </Form.Group>

                <hr />

                {/* 密碼變更 */}
                <h5>變更密碼</h5>
                <Form.Group className="mb-3">
                  <Form.Label>目前密碼</Form.Label>
                  <Form.Control
                    type="password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleInputChange}
                    placeholder="請輸入目前密碼"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>新密碼</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder="請輸入新密碼（至少4位）"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>確認新密碼</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="請再次輸入新密碼"
                  />
                </Form.Group>

                {/* 按鈕 */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    variant="secondary" 
                    onClick={handleCancel}
                    className="me-md-2"
                  >
                    取消
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? '儲存中...' : '儲存變更'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
