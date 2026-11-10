import React, { useState } from 'react';
import { mobileGatewayService } from '../services/mobileApi';
import { offlineQueue } from '../services/offlineQueue';
import {
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';

export default function SOSPage({ device, isOnline }) {
  const [category, setCategory] = useState('CYBER_INCIDENT');
  const [message, setMessage] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locationDesc, setLocationDesc] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentAlert, setSentAlert] = useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIncludeLocation(true);
      },
      (err) => {
        alert('Could not acquire GPS position. You may enter a location description manually.');
      }
    );
  };

  const handleTriggerSOS = async () => {
    if (!message.trim()) {
      alert('Please enter a brief description for the SOS broadcast.');
      return;
    }

    const payload = {
      alert_category: category,
      message: message.trim(),
      latitude: includeLocation && coords ? coords.lat : null,
      longitude: includeLocation && coords ? coords.lng : null,
      location_description: locationDesc.trim() || null,
    };

    setSubmitting(true);

    try {
      if (isOnline) {
        const res = await mobileGatewayService.submitSOS(device.device_id, device.api_key, payload);
        setSentAlert(res);
      } else {
        await offlineQueue.enqueue({
          action: 'submitSOS',
          deviceId: device.device_id,
          apiKey: device.api_key,
          payload,
        });
        setSentAlert({
          alert_id: 'queued-offline',
          status: 'QUEUED_OFFLINE',
          message: payload.message,
        });
      }
    } catch (err) {
      await offlineQueue.enqueue({
        action: 'submitSOS',
        deviceId: device.device_id,
        apiKey: device.api_key,
        payload,
      });
      setSentAlert({
        alert_id: 'queued-fallback',
        status: 'QUEUED_OFFLINE',
        message: payload.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="text-center space-y-1">
        <h1 className="text-lg font-black text-[#FF4545] flex items-center justify-center gap-2">
          <AlertOctagon className="w-6 h-6 text-[#FF4545]" />
          SOS DISTRESS BROADCAST
        </h1>
        <p className="text-xs text-[#8995A7]">
          High-priority emergency escalation to Central SOC
        </p>
      </div>

      {sentAlert ? (
        <div className="bg-[#0D121C] border border-[#19E68C]/40 p-6 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-[#19E68C]/20 border border-[#19E68C]/40 rounded-full mx-auto flex items-center justify-center text-[#19E68C]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-[#F4F7FB]">SOS Transmitted!</h2>
          <p className="text-xs text-[#8995A7]">
            Status: <span className="text-[#19E68C] font-mono font-bold">{sentAlert.status}</span>
          </p>
          <p className="text-[11px] text-[#8995A7]">
            "{sentAlert.message}"
          </p>
          <button
            onClick={() => setSentAlert(null)}
            className="text-xs text-[#00D4FF] underline font-bold mt-2"
          >
            Send Another Alert
          </button>
        </div>
      ) : (
        <div className="bg-[#0D121C] border border-[#162132] p-4 rounded-xl space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8995A7]">Distress Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#080B12] border border-[#162132] px-3 py-2 text-xs rounded-lg text-[#F4F7FB] focus:outline-none focus:border-[#FF4545]"
            >
              <option value="CYBER_INCIDENT">Active Cyber Breach / Intrusion</option>
              <option value="COMPROMISE_CONCERN">Suspected Device Hijack / Malware</option>
              <option value="PERSONAL_SAFETY">Operator Personal Safety Concern</option>
              <option value="SUSPICIOUS_ACTIVITY">Immediate Hostile Surveillance</option>
              <option value="EMERGENCY">General Urgent Distress</option>
            </select>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8995A7]">Distress Summary</label>
            <textarea
              required
              rows={3}
              placeholder="State the emergency condition briefly..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#080B12] border border-[#162132] p-3 text-xs rounded-lg text-[#F4F7FB] focus:outline-none focus:border-[#FF4545]"
            />
          </div>

          {/* Location option */}
          <div className="p-3 bg-[#080B12] rounded-lg border border-[#162132] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8995A7] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
                Attach GPS Location
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[11px] bg-[#162132] hover:bg-[#202C40] px-2.5 py-1 rounded text-[#00D4FF] font-mono"
              >
                {coords ? 'Acquired' : 'Get GPS'}
              </button>
            </div>
            {coords && (
              <div className="text-[10px] font-mono text-[#19E68C]">
                GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </div>
            )}
            <input
              type="text"
              placeholder="Facility / Floor description (e.g. Lab Sector 4)..."
              value={locationDesc}
              onChange={(e) => setLocationDesc(e.target.value)}
              className="w-full bg-[#05080E] border border-[#162132] px-2.5 py-1.5 text-xs rounded text-[#F4F7FB] focus:outline-none"
            />
          </div>

          {/* Explicit Confirmation Check */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#8995A7]">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded bg-[#080B12] border-[#162132] text-[#FF4545] focus:ring-0"
            />
            <span>
              I confirm this is an authentic emergency distress broadcast to the SOC.
            </span>
          </label>

          <button
            type="button"
            disabled={!confirmed || submitting}
            onClick={handleTriggerSOS}
            className={`w-full py-3.5 rounded-xl text-xs font-black tracking-widest transition flex items-center justify-center gap-2 ${
              confirmed && !submitting
                ? 'bg-[#FF4545] hover:bg-[#E03A3A] active:scale-98 text-[#080B12] shadow-[0_0_20px_rgba(255,69,69,0.4)]'
                : 'bg-[#162132] text-[#8995A7] cursor-not-allowed'
            }`}
          >
            {submitting ? 'TRANSMITTING SOS...' : 'CONFIRM & BROADCAST SOS'}
          </button>
        </div>
      )}
    </div>
  );
}

