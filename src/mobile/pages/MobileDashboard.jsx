import React, { useState, useEffect } from 'react';
import { mobileGatewayService } from '../services/mobileApi';
import { offlineQueue } from '../services/offlineQueue';
import {
  Shield,
  Smartphone,
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff,
  Link,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  CloudOff,
  ArrowRight,
} from 'lucide-react';

export default function MobileDashboard({ device, onNavigate, isOnline }) {
  const [status, setStatus] = useState(null);
  const [offlineCount, setOfflineCount] = useState(0);
  const [quickInspectUrl, setQuickInspectUrl] = useState('');
  const [inspectResult, setInspectResult] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const loadData = async () => {
      try {
        const s = await mobileGatewayService.getStatus();
        setStatus(s);
        setLastSync(new Date().toLocaleTimeString());
      } catch (err) {
        // Offline or server unreachable
      }
      const queued = await offlineQueue.getAll();
      setOfflineCount(queued.length);
    };
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickInspect = async (e) => {
    e.preventDefault();
    if (!quickInspectUrl.trim()) return;
    try {
      setInspecting(true);
      const res = await mobileGatewayService.inspectUrl(quickInspectUrl.trim());
      setInspectResult(res);
    } catch (err) {
      alert(`Inspection failed: ${err.message}`);
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Device Identity Banner */}
      <div className="bg-[#0D121C] border border-[#162132] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center text-[#00D4FF]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F4F7FB]">{device.device_name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-[#8995A7]">
                ID: {device.device_id.slice(0, 12)}...
              </span>
              <span className="text-[9px] bg-[#19E68C]/15 text-[#19E68C] px-1.5 py-0.2 rounded font-bold">
                {device.platform} v{device.app_version}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#19E68C] animate-pulse" />
                <span className="text-[#19E68C] font-bold">ONLINE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#FF4545]" />
                <span className="text-[#FF4545] font-bold">OFFLINE</span>
              </>
            )}
          </div>
          <span className="text-[9px] text-[#8995A7] mt-0.5">Sync: {lastSync}</span>
        </div>
      </div>

      {/* Offline Queue Notice */}
      {offlineCount > 0 && (
        <div className="bg-[#FFB547]/10 border border-[#FFB547]/30 p-3 rounded-lg flex items-center justify-between text-xs text-[#FFB547]">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4" />
            <span>{offlineCount} security report(s) queued offline</span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-[10px] underline font-bold"
          >
            Review Queue
          </button>
        </div>
      )}

      {/* Quick SOS Trigger Card */}
      <div className="bg-gradient-to-r from-[#FF4545]/20 to-[#0D121C] border border-[#FF4545]/40 p-4 rounded-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-[#FF4545]">
            <AlertTriangle className="w-4 h-4 text-[#FF4545]" />
            EMERGENCY ASSISTANCE
          </div>
          <p className="text-[11px] text-[#8995A7] mt-1">
            Trigger verified SOS distress broadcast to Central SOC
          </p>
        </div>
        <button
          onClick={() => onNavigate('sos')}
          className="bg-[#FF4545] hover:bg-[#E03A3A] active:scale-95 text-[#080B12] px-4 py-2 rounded-lg font-black text-xs tracking-wider transition shadow-[0_0_15px_rgba(255,69,69,0.3)]"
        >
          SOS NOW
        </button>
      </div>

      {/* Quick URL & Phish Inspector */}
      <div className="bg-[#0D121C] border border-[#162132] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#F4F7FB] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#00D4FF]" />
            URL / Link Threat Inspector
          </h3>
          <span className="text-[10px] text-[#8995A7]">Heuristic Scanner</span>
        </div>

        <form onSubmit={handleQuickInspect} className="flex gap-2">
          <input
            type="text"
            placeholder="Paste suspicious link (http/https)..."
            value={quickInspectUrl}
            onChange={(e) => setQuickInspectUrl(e.target.value)}
            className="flex-1 bg-[#080B12] border border-[#162132] px-3 py-2 text-xs rounded-lg text-[#F4F7FB] focus:outline-none focus:border-[#00D4FF]"
          />
          <button
            type="submit"
            disabled={inspecting}
            className="bg-[#00D4FF] hover:bg-[#00B4D8] text-[#080B12] font-bold px-3 py-2 text-xs rounded-lg transition"
          >
            {inspecting ? '...' : 'Scan'}
          </button>
        </form>

        {inspectResult && (
          <div
            className={`p-3 rounded-lg text-xs space-y-1.5 border ${
              inspectResult.is_suspicious
                ? 'bg-[#FF4545]/10 border-[#FF4545]/30 text-[#F4F7FB]'
                : 'bg-[#19E68C]/10 border-[#19E68C]/30 text-[#F4F7FB]'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span>Verdict: {inspectResult.verdict}</span>
              <span className="font-mono text-[11px]">
                Risk Score: {inspectResult.risk_score}/100
              </span>
            </div>
            <ul className="text-[11px] text-[#8995A7] list-disc list-inside space-y-0.5">
              {inspectResult.indicators.map((ind, i) => (
                <li key={i}>{ind}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('security')}
          className="p-3 bg-[#0D121C] hover:bg-[#121A28] border border-[#162132] rounded-xl text-left transition flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-[#F4F7FB]">Report Threat</div>
            <div className="text-[10px] text-[#8995A7] mt-0.5">SMS, Phish, Malware</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#00D4FF]" />
        </button>

        <button
          onClick={() => onNavigate('incidents')}
          className="p-3 bg-[#0D121C] hover:bg-[#121A28] border border-[#162132] rounded-xl text-left transition flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-[#F4F7FB]">SOC Feed</div>
            <div className="text-[10px] text-[#8995A7] mt-0.5">Incidents & Events</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#19E68C]" />
        </button>
      </div>

      {/* Gateway Overview */}
      <div className="bg-[#0D121C] border border-[#162132] p-4 rounded-xl">
        <h3 className="text-xs font-bold text-[#8995A7] uppercase tracking-wider mb-3">
          Central Gateway Telemetry
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-[#080B12] rounded border border-[#162132]">
            <div className="text-[10px] text-[#8995A7]">Registered Agents</div>
            <div className="text-base font-bold text-[#00D4FF] mt-0.5">
              {status?.active_devices_count ?? 1}
            </div>
          </div>
          <div className="p-2.5 bg-[#080B12] rounded border border-[#162132]">
            <div className="text-[10px] text-[#8995A7]">SOS Broadcasts</div>
            <div className="text-base font-bold text-[#FF4545] mt-0.5">
              {status?.total_sos_alerts ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
