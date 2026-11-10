import { apiClient } from './api';

export const defenceService = {
  getStatus: async () => {
    const res = await apiClient.get('/defence/status');
    return res.data;
  },

  getPolicies: async () => {
    const res = await apiClient.get('/defence/policies');
    return res.data;
  },

  listActions: async (params = {}) => {
    const res = await apiClient.get('/defence/actions', { params });
    return res.data;
  },

  proposeAction: async (proposalData) => {
    const res = await apiClient.post('/defence/propose', proposalData);
    return res.data;
  },

  approveAction: async (actionId) => {
    const res = await apiClient.post(`/defence/${actionId}/approve`);
    return res.data;
  },

  rejectAction: async (actionId, reason) => {
    const res = await apiClient.post(`/defence/${actionId}/reject`, null, {
      params: { reason },
    });
    return res.data;
  },

  rollbackAction: async (actionId) => {
    const res = await apiClient.post(`/defence/${actionId}/rollback`);
    return res.data;
  },
};
