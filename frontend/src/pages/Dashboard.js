import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('https://staff-schedule-您的-render-url.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div>載入中...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>龜馬山 志工排班系統</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Item className="text-white me-3 d-flex align-items-center">
              歡迎，{user?.name} ({user?.role === 'admin' ? '管理者' : 
                                user?.role === 'power_user' ? '組長' : '組員'})
            </Nav.Item>
            <Button variant="outline-light" onClick={handleLogout}>
              登出
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h3>儀表板</h3>
        <p>歡迎使用龜馬山 志工排班系統！</p>
        <p>您的帳號資訊：</p>
        <ul>
          <li>帳號：{user?.username}</li>
          <li>姓名：{user?.name}</li>
          <li>角色：{user?.role === 'admin' ? '管理者' : 
                   user?.role === 'power_user' ? '組長' : '組員'}</li>
        </ul>
      </Container>
    </div>
  );
};

export default Dashboard;
