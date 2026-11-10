import { apiClient } from './api';

export const copilotService = {
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

