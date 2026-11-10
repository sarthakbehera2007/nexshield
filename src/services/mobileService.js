import { apiClient } from './api';

export const mobileService = {
  getStatus: async () => {
    const res = await apiClient.get('/mobile/status');
    return res.data;
  },

  listDevices: async () => {
    const res = await apiClient.get('/mobile/devices');
    return res.data;
  },

  registerDevice: async (deviceData) => {
    const res = await apiClient.post('/mobile/register', deviceData);
    return res.data;
  },

  sendHeartbeat: async (deviceId, apiKey, telemetry = {}) => {
    const res = await apiClient.post(
      `/mobile/devices/${deviceId}/heartbeat`,
      telemetry,
      { headers: { 'X-Device-Key': apiKey } }
    );
    return res.data;
  },

  reportEvent: async (eventData, apiKey) => {
    const res = await apiClient.post('/mobile/events', eventData, {
      headers: { 'X-Device-Key': apiKey },
    });
    return res.data;
  },

  sendSOS: async (sosData, apiKey) => {
    const res = await apiClient.post('/mobile/sos', sosData, {
      headers: { 'X-Device-Key': apiKey },
    });
    return res.data;
  },

  inspectUrl: async (url, deviceId, apiKey) => {
    const headers = {};
    if (apiKey) headers['X-Device-Key'] = apiKey;
    const res = await apiClient.post(
      '/mobile/inspect-url',
      { url, device_id: deviceId },
      { headers }
    );
    return res.data;
  },

  revokeDevice: async (deviceId) => {
    const res = await apiClient.post(`/mobile/devices/${deviceId}/revoke`);
    return res.data;
  },
};
