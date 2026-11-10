/**
 * IndexedDB offline queue for storing mobile security reports and SOS alerts
 * when offline and auto-syncing when connectivity resumes.
 */

const DB_NAME = 'nexshield_mobile_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_events';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineQueue = {
  enqueue: async (item) => {
    try {
      const db = await openDB();
      if (!db) {
        // Fallback to memory or sessionStorage
        const items = JSON.parse(localStorage.getItem('nxs_offline_fallback') || '[]');
        items.push({ ...item, queued_at: new Date().toISOString(), status: 'PENDING' });
        localStorage.setItem('nxs_offline_fallback', JSON.stringify(items));
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.add({ ...item, queued_at: new Date().toISOString(), status: 'PENDING' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[OfflineQueue] enqueue error', err);
    }
  },

  getAll: async () => {
    try {
      const db = await openDB();
      if (!db) {
        return JSON.parse(localStorage.getItem('nxs_offline_fallback') || '[]');
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return [];
    }
  },

  remove: async (id) => {
    try {
      const db = await openDB();
      if (!db) {
        const items = JSON.parse(localStorage.getItem('nxs_offline_fallback') || '[]');
        const filtered = items.filter((i) => i.id !== id);
        localStorage.setItem('nxs_offline_fallback', JSON.stringify(filtered));
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[OfflineQueue] remove error', err);
    }
  },

  clear: async () => {
    try {
      const db = await openDB();
      if (!db) {
        localStorage.removeItem('nxs_offline_fallback');
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[OfflineQueue] clear error', err);
    }
  },
};

