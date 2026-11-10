/**
 * Robust WebSocket client with auto-reconnection, heartbeat, and pub/sub.
 */
class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/events';
    this.listeners = new Map();
    this.statusListeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000;
    this.heartbeatTimer = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const type = payload.message_type || payload.type || 'ALL';
          this.emit(type, payload.data || payload);
          this.emit('*', payload);
        } catch (e) {
          console.debug('[WS] Parse error', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WS] Error', err);
        this.ws?.close();
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    setTimeout(() => this.connect(), delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'HEARTBEAT', timestamp: new Date().toISOString() }));
      }
    }, 20000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  emit(eventType, data) {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((fn) => fn(data));
    }
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(connected) {
    this.statusListeners.forEach((fn) => fn(connected));
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();

