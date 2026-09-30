// frontend/src/api/axiosClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Автоматическая подстановка JWT токена в каждый запрос
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blossom_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Единая обработка 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Если токен просрочен или невалиден, очищаем хранилище
      localStorage.removeItem('blossom_token');
      localStorage.removeItem('blossom_user');
    }
    return Promise.reject(error);
  }
);