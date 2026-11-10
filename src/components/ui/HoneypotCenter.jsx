import React, { useState, useEffect } from 'react';
import { honeypotService } from '../../services/honeypotService';
import { Bug, Eye, Activity, ShieldAlert, XCircle, RefreshCw } from 'lucide-react';

export default function HoneypotCenter() {
  const [status, setStatus] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHoneypotData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusData, sessionsData, eventsData] = await Promise.all([
        honeypotService.getStatus(),
        honeypotService.listSessions(),
        honeypotService.listEvents({ limit: 20 }),
      ]);
      setStatus(statusData);
      setSessions(sessionsData);
      setEvents(eventsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch honeypot data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoneypotData();
  }, []);

  const handleCloseSession = async (sessionId) => {
    try {
      await honeypotService.closeSession(sessionId);
      await fetchHoneypotData();
    } catch (err) {
      alert(`Error closing session: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#080B12] text-[#F4F7FB] min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#0D1622] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#19E68C] flex items-center gap-2">
              <Bug className="w-6 h-6 text-[#19E68C]" />
              DIGITAL HONEYPOT CENTER
            </h1>
            <p className="text-xs text-[#8995A7]">Decoy services, attacker behavior classification & safe telemetry traps</p>
          </div>
          <button
            onClick={fetchHoneypotData}
            className="p-2 rounded bg-[#0D1622] hover:bg-[#131B2A] text-[#8995A7] transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#FF4545]/10 border border-[#FF4545]/30 rounded text-[#FF4545] text-xs">
            {error}
          </div>
        )}

        {/* Honeypot Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Honeypot Trap Status</span>
            <div className="text-xl font-bold text-[#19E68C] mt-1">
              {status?.enabled ? 'ACTIVE' : 'OFFLINE'}
            </div>
            <span className="text-[10px] text-[#8995A7]">{status?.bind_interface}</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Active Attacker Sessions</span>
            <div className="text-xl font-bold text-[#FFB547] mt-1">
              {status?.active_sessions_count ?? 0}
            </div>
            <span className="text-[10px] text-[#8995A7]">Simulated environment</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Total Decoy Interactions</span>
            <div className="text-xl font-bold text-[#00D4FF] mt-1">
              {status?.total_interactions_count ?? 0}
            </div>
            <span className="text-[10px] text-[#8995A7]">Probes & intrusions recorded</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Decoy Services</span>
            <div className="text-xl font-bold text-[#F4F7FB] mt-1">
              {status?.decoy_services?.length ?? 5} Active
            </div>
            <span className="text-[10px] text-[#19E68C]">HTTP, Admin, API, SSH, DB</span>
          </div>
        </div>

        {/* Sessions & Interactions Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Sessions */}
          <div className="bg-[#0D121C] rounded border border-[#162132] p-4">
            <h2 className="text-sm font-semibold text-[#F4F7FB] mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FFB547]" />
              Attacker Sessions
            </h2>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-xs text-[#8995A7]">No attacker sessions logged.</p>
              ) : (
                sessions.map((sess) => (
                  <div key={sess.id} className="p-3 bg-[#080B12] rounded border border-[#162132] space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-[#00D4FF]">{sess.source_ip}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sess.status === 'ACTIVE' ? 'bg-[#19E68C]/10 text-[#19E68C]' : 'bg-[#8995A7]/10 text-[#8995A7]'
                      }`}>
                        {sess.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8995A7]">
                      Class: <span className="text-[#FFB547]">{sess.primary_classification}</span>
                    </div>
                    <div className="text-[10px] text-[#8995A7]">
                      Interactions: {sess.interaction_count} | Touched: {(sess.services_touched || []).join(', ')}
                    </div>
                    {sess.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleCloseSession(sess.id)}
                        className="mt-2 text-[10px] text-[#FF4545] hover:underline flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Terminate Session
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Interaction Feed */}
          <div className="lg:col-span-2 bg-[#0D121C] rounded border border-[#162132] p-4">
            <h2 className="text-sm font-semibold text-[#F4F7FB] mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00D4FF]" />
              Recent Decoy Interactions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080B12] text-[#8995A7] border-b border-[#162132]">
                  <tr>
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3">IP</th>
                    <th className="py-2 px-3">Method/Path</th>
                    <th className="py-2 px-3">Classification</th>
                    <th className="py-2 px-3">Severity</th>
                    <th className="py-2 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162132]">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-[#8995A7]">
                        No decoy interactions yet.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-[#111724]">
                        <td className="py-2 px-3 font-semibold text-[#00D4FF]">{ev.service_name}</td>
                        <td className="py-2 px-3 font-mono">{ev.source_ip}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#8995A7]">
                          {ev.method} {ev.path}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-[#FFB547]">{ev.classification}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            ev.severity === 'CRITICAL' || ev.severity === 'HIGH'
                              ? 'bg-[#FF4545]/20 text-[#FF4545]'
                              : 'bg-[#19E68C]/20 text-[#19E68C]'
                          }`}>
                            {ev.severity}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[10px] text-[#8995A7]">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
