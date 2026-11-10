import React, { useState, useEffect } from 'react';
import { offlineQueue } from '../services/offlineQueue';
import { mobileGatewayService } from '../services/mobileApi';
import {
  Settings,
  Trash2,
  RefreshCw,
  Cloud,
  CloudOff,
  Key,
  Shield,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage({ device, onDeregister, isOnline }) {
  const [queuedItems, setQueuedItems] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const loadQueue = async () => {
    const items = await offlineQueue.getAll();
    setQueuedItems(items);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleSyncAll = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please connect to Wi-Fi/LAN.');
      return;
    }
    setSyncing(true);
    setSyncMsg(null);

    let successCount = 0;
    for (const item of queuedItems) {
      try {
        if (item.action === 'submitEvent') {
          await mobileGatewayService.submitEvent(item.deviceId, item.apiKey, item.payload);
        } else if (item.action === 'submitSOS') {
          await mobileGatewayService.submitSOS(item.deviceId, item.apiKey, item.payload);
        }
        await offlineQueue.remove(item.id);
        successCount++;
      } catch (err) {
        console.warn('Sync failed for item', item.id, err);
      }
    }

    await loadQueue();
    setSyncing(false);
    setSyncMsg(`Successfully synchronized ${successCount} queued item(s) to Central SOC.`);
  };

  const handleClearQueue = async () => {
    if (!window.confirm('Clear all unsent offline reports?')) return;
    await offlineQueue.clear();
    await loadQueue();
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-lg font-bold text-[#F4F7FB] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#8995A7]" />
          Agent Settings & Synchronization
        </h1>
        <p className="text-xs text-[#8995A7]">Local storage, offline queue & device credentials</p>
      </div>

      {syncMsg && (
        <div className="p-3 bg-[#19E68C]/10 border border-[#19E68C]/30 rounded-xl text-xs text-[#19E68C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncMsg}</span>
        </div>
      )}

      {/* Offline Queue Section */}
      <div className="bg-[#0D121C] border border-[#162132] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#00D4FF]" />
            <h2 className="text-xs font-bold text-[#F4F7FB]">Offline Event Queue</h2>
          </div>
          <span className="text-[10px] bg-[#162132] px-2 py-0.5 rounded font-mono text-[#00D4FF]">
            {queuedItems.length} queued
          </span>
        </div>

        <p className="text-[11px] text-[#8995A7]">
          Reports submitted without network connectivity are safely stored in IndexedDB.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleSyncAll}
            disabled={syncing || queuedItems.length === 0}
            className="flex-1 bg-[#00D4FF] hover:bg-[#00B4D8] disabled:opacity-50 text-[#080B12] font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Queue Now'}
          </button>
          {queuedItems.length > 0 && (
            <button
              onClick={handleClearQueue}
              className="px-3 bg-[#FF4545]/10 hover:bg-[#FF4545]/20 text-[#FF4545] rounded-lg text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Device Credentials */}
      <div className="bg-[#0D121C] border border-[#162132] p-4 rounded-xl space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#F4F7FB]">
          <Key className="w-4 h-4 text-[#FFB547]" />
          Device Authentication Details
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#8995A7]">Device ID:</span>
            <span className="text-[#F4F7FB]">{device.device_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8995A7]">Platform:</span>
            <span className="text-[#19E68C]">{device.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8995A7]">API Key:</span>
            <span className="text-[#8995A7]">{device.api_key.slice(0, 12)}••••••••</span>
          </div>
        </div>

        <button
          onClick={onDeregister}
          className="w-full mt-2 py-2 bg-[#FF4545]/10 hover:bg-[#FF4545]/20 border border-[#FF4545]/30 text-[#FF4545] rounded-lg font-bold text-xs transition"
        >
          Deregister / Remove Device from Storage
        </button>
      </div>
    </div>
  );
}

