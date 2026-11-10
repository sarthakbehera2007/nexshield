import { apiClient } from './api';

export const copilotService = {
  chat: async (message, incidentId = null) => {
    const res = await apiClient.post('/copilot/chat', {
      message,
      incident_id: incidentId,
    });
    return res.data;
  },

  analyzeIncident: async (incidentId, query) => {
    const res = await apiClient.post('/copilot/chat', {
      incident_id: incidentId,
      message: query,
    });
    return res.data;
  },

  getStatus: async () => {
    const res = await apiClient.get('/copilot/status');
    return res.data;
  },
};
