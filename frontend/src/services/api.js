import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

// Thêm interceptor để gắn token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isLoggingOut = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login' && !isLoggingOut) {
      isLoggingOut = true;
      localStorage.removeItem('token');
      // Optionally: dispatch(logout()) nếu có thể truy cập store ở đây
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
