import axios from 'axios';

// 從環境變數獲取 API 基礎 URL（如果有的話）
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://您的-render-url.onrender.com/api';

// 建立 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
});

// 請求攔截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token 過期或無效，清除本地儲存並重新導向
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// 認證相關 API
export const authService = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  getUserInfo: () => 
    api.get('/auth/me'),
};

// 排班相關 API
export const scheduleService = {
  // 獲取指定月份的排班
  getMonthSchedule: (year, month) => 
    api.get(`/schedules/${year}/${month}`),
  
  // 獲取用戶的排班
  getUserSchedule: (userId, year, month) => 
    api.get(`/schedules/user/${userId}/${year}/${month}`),
  
  // 獲取組別排班
  getGroupSchedule: (groupId, year, month) => 
    api.get(`/schedules/group/${groupId}/${year}/${month}`),
  
  // 申請排班
  requestSchedule: (scheduleData) => 
    api.post('/schedules/request', scheduleData),
  
  // 管理員/組長設定排班
  setSchedule: (scheduleData) => 
    api.post('/schedules/set', scheduleData),
};
