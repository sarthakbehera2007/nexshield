import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetails = {
      message: error.response?.data?.detail || error.message || 'Network error connecting to NEXSHIELD central host',
      status: error.response?.status,
      url: error.config?.url,
    };
    return Promise.reject(errorDetails);
  }
);

export default apiClient;
