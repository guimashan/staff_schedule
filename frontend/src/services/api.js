// frontend/src/services/api.js (更新後)
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 請求攔截器 - 添加認證token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理token過期
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 志工相關API
export const volunteerAPI = {
  getAll: () => api.get('/volunteers'),
  getById: (id) => api.get(`/volunteers/${id}`),
  create: (data) => api.post('/volunteers', data),
  update: (id, data) => api.put(`/volunteers/${id}`, data),
  delete: (id) => api.delete(`/volunteers/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/volunteers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  getStats: () => api.get('/volunteers/stats'),
  search: (query) => api.get(`/volunteers/search?q=${encodeURIComponent(query)}`)
};

// 排班相關API
export const scheduleAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getStats: () => api.get('/schedules/stats'),
  getMonthly: (year, month) => api.get(`/schedules/monthly?year=${year}&month=${month}`),
  getWeekly: (startDate) => api.get(`/schedules/weekly?start_date=${startDate}`)
};

// 通知相關API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  getStats: () => api.get('/notifications/stats')
};

export default api;
