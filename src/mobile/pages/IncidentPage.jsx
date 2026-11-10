import React, { useState, useEffect } from 'react';
import { mobileGatewayService } from '../services/mobileApi';
import { incidentService } from '../../services/incidentService';
import { Shield, AlertCircle, RefreshCw, Radio } from 'lucide-react';

export default function IncidentPage({ device }) {
  const [incidents, setIncidents] = useState([]);
  const [mobileReports, setMobileReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const [incRes, repRes] = await Promise.all([
        incidentService.listIncidents({ limit: 10 }).catch(() => ({ items: [] })),
        mobileGatewayService.listEvents({ device_id: device.device_id, limit: 10 }).catch(() => []),
      ]);
      setIncidents(incRes.items || []);
      setMobileReports(repRes || []);
    } catch (e) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F4F7FB] flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#00D4FF]" />
            SOC Incident Feed
          </h1>
          <p className="text-xs text-[#8995A7]">Active cluster alerts & device reports</p>
        </div>
        <button
          onClick={fetchIncidents}
          className="p-2 bg-[#0D121C] rounded-lg text-[#8995A7] hover:text-[#F4F7FB]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Reports sent by this device */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#8995A7] uppercase tracking-wider">
          Reports Sent by this Device
        </h2>
        {mobileReports.length === 0 ? (
          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl text-center text-xs text-[#8995A7]">
            No mobile incident reports recorded from this agent yet.
          </div>
        ) : (
          mobileReports.map((rep) => (
            <div key={rep.id} className="p-3 bg-[#0D121C] border border-[#162132] rounded-xl space-y-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-[#00D4FF]">{rep.event_type}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  rep.severity === 'HIGH' || rep.severity === 'CRITICAL'
                    ? 'bg-[#FF4545]/20 text-[#FF4545]'
                    : 'bg-[#19E68C]/20 text-[#19E68C]'
                }`}>
                  {rep.severity}
                </span>
              </div>
              <p className="text-xs text-[#F4F7FB]">{rep.description}</p>
              <div className="text-[10px] text-[#8995A7] font-mono">
                {new Date(rep.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Global Incidents */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#8995A7] uppercase tracking-wider">
          Central SOC Correlated Clusters
        </h2>
        {incidents.length === 0 ? (
          <div className="p-4 bg-[#0D121C] border border-[#162132] rounded-xl text-center text-xs text-[#8995A7]">
            No critical cluster incidents active on backend.
          </div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="p-3 bg-[#0D121C] border border-[#162132] rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F4F7FB]">{inc.title || `Incident #${inc.id}`}</div>
                <div className="text-[10px] text-[#8995A7] mt-0.5 font-mono">
                  Status: <span className="text-[#00D4FF]">{inc.status}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-[#FF4545]">{inc.risk_score || 75}</div>
                <div className="text-[9px] text-[#8995A7]">RISK</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

