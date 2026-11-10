import { apiClient } from './api';

export const incidentService = {
  listIncidents: async (params = {}) => {
    const res = await apiClient.get('/incidents/', { params });
    return res.data;
  },

  getIncident: async (incidentId) => {
    const res = await apiClient.get(`/incidents/${incidentId}`);
    return res.data;
  },

  updateStatus: async (incidentId, status) => {
    const res = await apiClient.patch(`/incidents/${incidentId}/status`, null, {
      params: { status },
    });
    return res.data;
  },

  listEvents: async (params = {}) => {
    const res = await apiClient.get('/events/', { params });
    return res.data;
  },
};
