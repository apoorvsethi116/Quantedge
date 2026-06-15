import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api'
});

// Interceptor to automatically attach your signed JWT passport to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// 1. AUTHENTICATION SERVICE CALLS
// ==========================================
export const loginAPI = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// ==========================================
// 2. QUANT STRATEGY SYSTEM CALLS
// ==========================================
export const runBacktestAPI = async (payload) => {
  const response = await API.post('/strategy/backtest', payload);
  return response.data;
};

export const getBacktestHistoryAPI = async () => {
  const response = await API.get('/strategy/history');
  return response.data;
};

export const clearBacktestHistoryAPI = async () => {
  const response = await API.delete('/strategy/history/clear');
  return response.data;
};

export const getLivePriceAPI = async (ticker) => {
  const response = await API.post('/strategy/live-price', { ticker });
  return response.data;
};

export default API;