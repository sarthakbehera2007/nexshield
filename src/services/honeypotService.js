import { apiClient } from './api';

export const honeypotService = {
  getStatus: async () => {
    const res = await apiClient.get('/honeypot/status');
    return res.data;
  },

  listServices: async () => {
    const res = await apiClient.get('/honeypot/services');
    return res.data;
  },

  listSessions: async (params = {}) => {
    const res = await apiClient.get('/honeypot/sessions', { params });
    return res.data;
  },

  listEvents: async (params = {}) => {
    const res = await apiClient.get('/honeypot/events', { params });
    return res.data;
  },

  closeSession: async (sessionId) => {
    const res = await apiClient.post(`/honeypot/sessions/${sessionId}/close`);
    return res.data;
  },
};

