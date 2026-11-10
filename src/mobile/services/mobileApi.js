import { apiClient } from '../../services/api';

export const mobileGatewayService = {
  // Gateway status
  getStatus: async () => {
    const res = await apiClient.get('/mobile/status');
    return res.data;
  },

  // Device registration
  registerDevice: async (registrationData) => {
    const res = await apiClient.post('/mobile/register', registrationData);
    return res.data;
  },

  // List registered devices (for SOC dashboard)
  listDevices: async (params = {}) => {
    const res = await apiClient.get('/mobile/devices', { params });
    return res.data;
  },

  // Get device details
  getDeviceDetails: async (deviceId) => {
    const res = await apiClient.get(`/mobile/devices/${deviceId}`);
    return res.data;
  },

  // Heartbeat
  sendHeartbeat: async (deviceId, apiKey, payload = {}) => {
    const res = await apiClient.post(`/mobile/devices/${deviceId}/heartbeat`, payload, {
      headers: {
        'X-Device-ID': deviceId,
        'X-API-Key': apiKey,
      },
    });
    return res.data;
  },

  // Revoke device credential
  revokeDevice: async (deviceId) => {
    const res = await apiClient.delete(`/mobile/devices/${deviceId}`, {
      params: { revoke_only: true },
    });
    return res.data;
  },

  // Submit mobile security event
  submitEvent: async (deviceId, apiKey, eventData) => {
    const res = await apiClient.post('/mobile/events', eventData, {
      headers: {
        'X-Device-ID': deviceId,
        'X-API-Key': apiKey,
      },
    });
    return res.data;
  },

  // List mobile events
  listEvents: async (params = {}) => {
    const res = await apiClient.get('/mobile/events', { params });
    return res.data;
  },

  // Submit SOS Alert
  submitSOS: async (deviceId, apiKey, sosData) => {
    const res = await apiClient.post('/mobile/sos', sosData, {
      headers: {
        'X-Device-ID': deviceId,
        'X-API-Key': apiKey,
      },
    });
    return res.data;
  },

  // List SOS alerts
  listSOSAlerts: async (params = {}) => {
    const res = await apiClient.get('/mobile/sos', { params });
    return res.data;
  },

  // Inspect URL heuristics
  inspectUrl: async (url) => {
    const res = await apiClient.post('/mobile/inspect-url', { url });
    return res.data;
  },
};
