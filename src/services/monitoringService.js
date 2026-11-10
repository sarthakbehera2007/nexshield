import { apiClient } from './api';

export const monitoringService = {
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  getSystemStatus: async () => {
    const res = await apiClient.get('/system/status');
    return res.data;
  },

  getNetworkStatus: async () => {
    const res = await apiClient.get('/monitoring/network');
    return res.data;
  },

  listSensors: async () => {
    const res = await apiClient.get('/monitoring/sensors');
    return res.data;
  },
};

