import React, { useState, useEffect } from 'react';
import { mobileService } from '../../services/mobileService';
import {
  Smartphone,
  Shield,
  AlertTriangle,
  Radio,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldBan,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

export default function MobileGatewayCenter({ onLaunchMobileView }) {
  const [status, setStatus] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL inspection tool state
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspectResult, setInspectResult] = useState(null);
  const [inspecting, setInspecting] = useState(false);

  const fetchGatewayData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusData, devicesData] = await Promise.all([
        mobileService.getStatus(),
        mobileService.listDevices(),
      ]);
      setStatus(statusData);
      setDevices(devicesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch Mobile Gateway telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewayData();
    const interval = setInterval(fetchGatewayData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRevoke = async (deviceId) => {
    if (!window.confirm(`Revoke device credential for ${deviceId}? The mobile device will be immediately barred from reporting events.`)) {
      return;
    }
    try {
      await mobileService.revokeDevice(deviceId);
      await fetchGatewayData();
    } catch (err) {
      alert(`Revocation error: ${err.message}`);
    }
  };

  const handleInspectUrl = async (e) => {
    e.preventDefault();
    if (!inspectUrl.trim()) return;
    try {
      setInspecting(true);
      const result = await mobileService.inspectUrl(inspectUrl.trim());
      setInspectResult(result);
    } catch (err) {
      alert(`Inspection error: ${err.message}`);
    } finally {
      setInspecting(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-[#FF4545] border-[#FF4545]/40 bg-[#FF4545]/10';
      case 'HIGH':
        return 'text-[#FFB547] border-[#FFB547]/40 bg-[#FFB547]/10';
      case 'MEDIUM':
        return 'text-[#00D4FF] border-[#00D4FF]/40 bg-[#00D4FF]/10';
      default:
        return 'text-[#19E68C] border-[#19E68C]/40 bg-[#19E68C]/10';
    }
  };

  return (
    <div className="bg-[#080B12] text-[#F4F7FB] min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#162132] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg text-[#00D4FF]">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-white">
                  MOBILE SECURITY GATEWAY
                </h1>
                <p className="text-xs text-[#8995A7]">
                  Phase 9 · Edge telemetry, cryptographically keyed Android agents & distress monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLaunchMobileView && (
              <button
                onClick={onLaunchMobileView}
                className="px-3.5 py-1.5 rounded-lg bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 border border-[#00D4FF]/40 text-[#00D4FF] text-xs font-mono font-bold flex items-center gap-2 transition"
              >
                <Smartphone className="w-4 h-4" />
                SIMULATE MOBILE APP
              </button>
            )}
            <button
              onClick={fetchGatewayData}
              disabled={loading}
              className="p-2 rounded-lg bg-[#0D121C] hover:bg-[#162132] border border-[#162132] text-[#8995A7] transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00D4FF]' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#FF4545]/10 border border-[#FF4545]/30 rounded-lg text-[#FF4545] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Telemetry Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8995A7]">Status</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#19E68C] animate-pulse" />
              <span className="text-base font-bold text-white font-mono">
                {status?.status || 'ONLINE'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8995A7]">Registered Devices</span>
            <div className="mt-2 text-2xl font-bold font-mono text-[#00D4FF]">
              {status?.active_devices_count ?? status?.registered_devices ?? devices.length}
            </div>
          </div>

          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8995A7]">Active Heartbeats</span>
            <div className="mt-2 text-2xl font-bold font-mono text-[#19E68C]">
              {status?.online_devices_count ?? status?.active_devices ?? devices.filter(d => d.credential_status === 'ACTIVE').length}
            </div>
          </div>

          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8995A7]">Mobile Events</span>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FFB547]">
              {status?.total_events_reported ?? status?.total_reports ?? 0}
            </div>
          </div>

          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8995A7]">SOS Distress Alerts</span>
            <div className="mt-2 text-2xl font-bold font-mono text-[#FF4545]">
              {status?.total_sos_alerts ?? 0}
            </div>
          </div>
        </div>

        {/* Devices Roster */}
        <div className="bg-[#0D121C] border border-[#162132] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00D4FF]" />
              <h2 className="text-sm font-bold text-white tracking-wide font-mono">
                REGISTERED MOBILE FLEET
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8995A7]">
              {devices.length} {devices.length === 1 ? 'Device' : 'Devices'} Tracked
            </span>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8995A7] border border-dashed border-[#162132] rounded-lg">
              <Smartphone className="w-8 h-8 text-[#8995A7]/40 mx-auto mb-2" />
              No mobile devices registered yet.
              <p className="mt-1 text-[11px] text-[#8995A7]/70">
                Click &quot;SIMULATE MOBILE APP&quot; or pair an Android device via PWA to onboard.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#162132] text-[#8995A7]">
                    <th className="py-2.5 px-3">DEVICE NAME</th>
                    <th className="py-2.5 px-3">PLATFORM</th>
                    <th className="py-2.5 px-3">DEVICE ID</th>
                    <th className="py-2.5 px-3">CREDENTIAL</th>
                    <th className="py-2.5 px-3">REGISTERED</th>
                    <th className="py-2.5 px-3">LAST SEEN</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162132]">
                  {devices.map((dev) => {
                    const isRevoked = dev.credential_status === 'REVOKED';
                    return (
                      <tr key={dev.device_id} className="hover:bg-[#121A27] transition">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <Smartphone className="w-3.5 h-3.5 text-[#00D4FF]" />
                          <span>{dev.device_name}</span>
                        </td>
                        <td className="py-3 px-3 text-[#8995A7]">
                          <span className="px-1.5 py-0.5 rounded bg-[#162132] text-[10px]">
                            {dev.platform} {dev.app_version ? `v${dev.app_version}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#8995A7] font-mono text-[10px]">
                          {dev.device_id.slice(0, 16)}...
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isRevoked
                                ? 'bg-[#FF4545]/10 border-[#FF4545]/30 text-[#FF4545]'
                                : 'bg-[#19E68C]/10 border-[#19E68C]/30 text-[#19E68C]'
                            }`}
                          >
                            {dev.credential_status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#8995A7] text-[11px]">
                          {dev.registered_at ? new Date(dev.registered_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-[#8995A7] text-[11px]">
                          {dev.last_seen ? new Date(dev.last_seen).toLocaleTimeString() : 'Never'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!isRevoked ? (
                            <button
                              onClick={() => handleRevoke(dev.device_id)}
                              className="px-2 py-1 bg-[#FF4545]/10 hover:bg-[#FF4545]/20 border border-[#FF4545]/30 text-[#FF4545] rounded text-[10px] flex items-center gap-1 ml-auto transition"
                              title="Revoke device credentials"
                            >
                              <ShieldBan className="w-3 h-3" />
                              Revoke
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#8995A7] italic">Revoked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Gateway URL Inspector Testing Utility */}
        <div className="bg-[#0D121C] border border-[#162132] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00D4FF]" />
            <h2 className="text-sm font-bold text-white tracking-wide font-mono">
              GATEWAY HEURISTIC URL INSPECTOR (STANDALONE ENGINE TEST)
            </h2>
          </div>
          <p className="text-xs text-[#8995A7]">
            Directly test the Gateway URL heuristic inspection engine against raw IP hosts, suspicious TLDs, hex obfuscations, and phishing indicators.
          </p>

          <form onSubmit={handleInspectUrl} className="flex gap-2">
            <input
              type="text"
              value={inspectUrl}
              onChange={(e) => setInspectUrl(e.target.value)}
              placeholder="e.g. http://192.168.1.100:8080/secure-login-update.zip"
              className="flex-1 bg-[#080B12] border border-[#162132] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#8995A7]/40 focus:outline-none focus:border-[#00D4FF]"
            />
            <button
              type="submit"
              disabled={inspecting}
              className="px-4 py-2 bg-[#00D4FF] hover:bg-[#33E8FF] text-[#080B12] font-bold text-xs rounded-lg transition disabled:opacity-50"
            >
              {inspecting ? 'Analyzing...' : 'Inspect URL'}
            </button>
          </form>

          {inspectResult && (
            <div className={`p-4 rounded-lg border ${getRiskColor(inspectResult.risk_level)} space-y-2`}>
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span>URL: {inspectResult.url}</span>
                <span>RISK LEVEL: {inspectResult.risk_level} (SCORE: {inspectResult.risk_score}/100)</span>
              </div>
              {inspectResult.reasons && inspectResult.reasons.length > 0 && (
                <div className="space-y-1 mt-2">
                  <span className="text-[10px] uppercase font-mono block tracking-wider">Triggered Heuristics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectResult.reasons.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

