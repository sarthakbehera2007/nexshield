import React, { useState } from 'react';
import { mobileGatewayService } from '../services/mobileApi';
import { offlineQueue } from '../services/offlineQueue';
import {
  ShieldAlert,
  Send,
  Link,
  MessageSquare,
  Smartphone,
  Cpu,
  UserX,
  FileWarning,
  CheckCircle2,
  CloudOff,
} from 'lucide-react';

const THREAT_TYPES = [
  { id: 'SUSPICIOUS_URL', label: 'Suspicious Link / Phishing', icon: Link },
  { id: 'SUSPICIOUS_SMS', label: 'SMS / Smishing Attack', icon: MessageSquare },
  { id: 'UNKNOWN_DEVICE', label: 'Unknown Device / Bluetooth', icon: Smartphone },
  { id: 'APP_ANOMALY', label: 'App Crash / Background Drain', icon: Cpu },
  { id: 'ACCOUNT_COMPROMISE', label: 'Account Compromise Concern', icon: UserX },
  { id: 'GENERAL_INCIDENT', label: 'General Cyber Incident', icon: FileWarning },
];

export default function SecurityCenter({ device, isOnline }) {
  const [selectedType, setSelectedType] = useState('SUSPICIOUS_URL');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const reportPayload = {
      event_type: selectedType,
      severity: severity,
      description: description.trim(),
      evidence_metadata: evidenceUrl.trim() ? { url: evidenceUrl.trim() } : {},
      source: 'mobile_pwa',
      is_demo: false,
    };

    setSubmitting(true);
    setSuccessMsg(null);

    try {
      if (isOnline) {
        await mobileGatewayService.submitEvent(device.device_id, device.api_key, reportPayload);
        setSuccessMsg('Security report transmitted directly to Central SOC!');
      } else {
        // Enqueue offline
        await offlineQueue.enqueue({
          action: 'submitEvent',
          deviceId: device.device_id,
          apiKey: device.api_key,
          payload: reportPayload,
        });
        setSuccessMsg('Offline: Report safely stored in local queue. Will sync automatically upon reconnection.');
      }
      setDescription('');
      setEvidenceUrl('');
    } catch (err) {
      // In case of network failure, fallback enqueue
      await offlineQueue.enqueue({
        action: 'submitEvent',
        deviceId: device.device_id,
        apiKey: device.api_key,
        payload: reportPayload,
      });
      setSuccessMsg('Network error: Queued in offline cache for automatic sync.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-lg font-bold text-[#F4F7FB] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#00D4FF]" />
          Report Threat / Security Event
        </h1>
        <p className="text-xs text-[#8995A7]">
          Forward suspicious activity, messages, and payloads to the SOC
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-[#19E68C]/10 border border-[#19E68C]/30 rounded-xl text-xs text-[#19E68C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Threat Type Selector Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8995A7]">Threat Category</label>
          <div className="grid grid-cols-2 gap-2">
            {THREAT_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition text-xs ${
                    isSelected
                      ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#00D4FF] font-bold'
                      : 'bg-[#0D121C] border-[#162132] text-[#8995A7] hover:bg-[#121A28]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8995A7]">Severity</label>
          <div className="grid grid-cols-4 gap-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => setSeverity(lvl)}
                className={`py-2 rounded-lg text-xs font-mono font-bold transition border ${
                  severity === lvl
                    ? lvl === 'CRITICAL' || lvl === 'HIGH'
                      ? 'bg-[#FF4545] border-[#FF4545] text-[#080B12]'
                      : 'bg-[#00D4FF] border-[#00D4FF] text-[#080B12]'
                    : 'bg-[#0D121C] border-[#162132] text-[#8995A7]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8995A7]">Observation / Details</label>
          <textarea
            required
            rows={3}
            placeholder="Describe the suspicious behavior, message content, or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#0D121C] border border-[#162132] p-3 text-xs rounded-xl text-[#F4F7FB] focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {/* Evidence Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8995A7]">Suspicious URL or Indicator (Optional)</label>
          <input
            type="text"
            placeholder="http://..."
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            className="w-full bg-[#0D121C] border border-[#162132] px-3 py-2.5 text-xs rounded-xl text-[#F4F7FB] focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#00D4FF] hover:bg-[#00B4D8] active:scale-98 text-[#080B12] font-bold py-3 rounded-xl text-xs tracking-wider transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
        >
          {submitting ? 'Transmitting...' : (
            <>
              <Send className="w-4 h-4" />
              Submit Incident Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}

