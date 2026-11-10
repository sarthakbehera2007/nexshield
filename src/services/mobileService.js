import { apiClient } from './api';

export const mobileService = {
  inspectRequest: async (payload) => {
    const res = await apiClient.post('/mobile/inspect', payload);
    return res.data;
  },
};
