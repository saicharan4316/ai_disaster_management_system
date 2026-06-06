import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ai-disaster-management-system-c4xm.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header dynamically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
