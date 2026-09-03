import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor adding Authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jamia_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('jamia_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh/', { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem('jamia_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('jamia_access_token');
          localStorage.removeItem('jamia_refresh_token');
          localStorage.removeItem('jamia_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('jamia_access_token');
        localStorage.removeItem('jamia_refresh_token');
        localStorage.removeItem('jamia_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
