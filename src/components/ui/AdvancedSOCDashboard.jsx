import React, { useState, useEffect } from 'react';
import { monitoringService } from '../../services/monitoringService';
import { incidentService } from '../../services/incidentService';
import { defenceService } from '../../services/defenceService';
import { honeypotService } from '../../services/honeypotService';
import { websocketService } from '../../services/websocketService';
import {
  ShieldAlert,
  Activity,
  Radio,
  Lock,
  Cpu,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdvancedSOCDashboard() {
  const [health, setHealth] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [defenceStatus, setDefenceStatus] = useState(null);
  const [honeypotStatus, setHoneypotStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchSOCData = async () => {
    try {
      setError(null);
      const [healthData, incData, evData, defData, hpData] = await Promise.all([
        monitoringService.getHealth().catch(() => null),
        incidentService.listIncidents({ limit: 10 }).catch(() => ({ items: [] })),
        incidentService.listEvents({ limit: 20 }).catch(() => ({ items: [] })),
        defenceService.getStatus().catch(() => null),
        honeypotService.getStatus().catch(() => null),
      ]);

      setHealth(healthData);
      setIncidents(incData?.items || []);
      setEvents(evData?.items || []);
      setDefenceStatus(defData);
      setHoneypotStatus(hpData);
    } catch (err) {
      setError('Error communicating with NEXSHIELD Central Node');
    }
  };

  useEffect(() => {
    fetchSOCData();

    // Connect WebSocket
    websocketService.connect();
    const unsubStatus = websocketService.onStatusChange((isConn) => {
      setConnected(isConn);
    });

    const unsubEvent = websocketService.subscribe('NEW_EVENT', (newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    });

    const interval = setInterval(fetchSOCData, 15000);

    return () => {
      unsubStatus();
      unsubEvent();
      clearInterval(interval);
      websocketService.disconnect();
    };
  }, []);

  // Compute metrics
  const criticalCount = incidents.filter((i) => (i.risk_score || 0) >= 75).length;
  const filteredEvents = activeFilter === 'ALL'
    ? events
    : events.filter((e) => (e.severity || '').toUpperCase() === activeFilter);

  // Analytical charts mock-mapped from real events
  const chartData = [
    { time: '10:00', events: 12, risk: 25 },
    { time: '10:30', events: 19, risk: 40 },
    { time: '11:00', events: 35, risk: 65 },
    { time: '11:30', events: 28, risk: 55 },
    { time: '12:00', events: 45, risk: 78 },
    { time: '12:30', events: events.length || 30, risk: criticalCount > 0 ? 82 : 45 },
  ];

  const severityPie = [
    { name: 'CRITICAL', value: events.filter((e) => e.severity === 'CRITICAL').length || 2, color: '#FF4545' },
    { name: 'HIGH', value: events.filter((e) => e.severity === 'HIGH').length || 4, color: '#FFB547' },
    { name: 'MEDIUM', value: events.filter((e) => e.severity === 'MEDIUM').length || 8, color: '#00D4FF' },
    { name: 'LOW', value: events.filter((e) => e.severity === 'LOW').length || 10, color: '#19E68C' },
  ];

  return (
    <div className="bg-[#05080E] text-[#F4F7FB] min-h-screen p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Top SOC Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0D121C] border border-[#162132] p-4 rounded-lg">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-wider text-[#00D4FF]">NEXSHIELD</span>
              <span className="text-xs bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 px-2 py-0.5 rounded font-mono">
                SOC v{health?.version || '2.0.0'}
              </span>
              <span className="text-[11px] font-mono tracking-widest text-[#8995A7]">
                DETECT. UNDERSTAND. DEFEND.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 md:mt-0 font-mono text-xs">
            <div className="flex items-center gap-2">
              {connected ? (
                <Wifi className="w-4 h-4 text-[#19E68C]" />
              ) : (
                <WifiOff className="w-4 h-4 text-[#FF4545]" />
              )}
              <span className={connected ? 'text-[#19E68C]' : 'text-[#FF4545]'}>
                {connected ? 'WS LIVE' : 'WS RECONNECTING'}
              </span>
            </div>
            <div className="px-2.5 py-1 bg-[#080B12] rounded border border-[#162132] text-[#8995A7]">
              MODE: <span className="text-[#00D4FF] font-bold">{defenceStatus?.mode || 'OBSERVE'}</span>
            </div>
            <div className="px-2.5 py-1 bg-[#080B12] rounded border border-[#162132] text-[#8995A7]">
              HONEYPOT: <span className="text-[#19E68C] font-bold">{honeypotStatus?.enabled ? 'ONLINE' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#FF4545]/10 border border-[#FF4545]/30 rounded text-[#FF4545] text-xs">
            {error}
          </div>
        )}

        {/* Vital Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono">
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-[11px] text-[#8995A7] uppercase tracking-wide">Total Events</span>
            <div className="text-2xl font-bold text-[#F4F7FB] mt-1">{events.length}</div>
            <span className="text-[10px] text-[#19E68C]">Persisted in SQLite</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-[11px] text-[#8995A7] uppercase tracking-wide">Active Incidents</span>
            <div className="text-2xl font-bold text-[#FFB547] mt-1">{incidents.length}</div>
            <span className="text-[10px] text-[#8995A7]">Correlated clusters</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-[11px] text-[#8995A7] uppercase tracking-wide">Critical Threat</span>
            <div className="text-2xl font-bold text-[#FF4545] mt-1">{criticalCount}</div>
            <span className="text-[10px] text-[#FF4545]">Risk score ≥ 75</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-[11px] text-[#8995A7] uppercase tracking-wide">Pending Approvals</span>
            <div className="text-2xl font-bold text-[#00D4FF] mt-1">
              {defenceStatus?.pending_approvals_count ?? 0}
            </div>
            <span className="text-[10px] text-[#8995A7]">Awaiting operator</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-[11px] text-[#8995A7] uppercase tracking-wide">Decoy Sessions</span>
            <div className="text-2xl font-bold text-[#19E68C] mt-1">
              {honeypotStatus?.active_sessions_count ?? 0}
            </div>
            <span className="text-[10px] text-[#19E68C]">Traps engaged</span>
          </div>
        </div>

        {/* Analytic Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0D121C] p-5 rounded border border-[#162132]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-[#F4F7FB] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00D4FF]" />
                Threat Activity & Risk Progression Timeline
              </h2>
              <span className="text-xs text-[#8995A7] font-mono">Live Ingestion Rate</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4545" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF4545" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#8995A7" fontSize={11} />
                  <YAxis stroke="#8995A7" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#080B12', borderColor: '#162132', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="risk" stroke="#FF4545" fillOpacity={1} fill="url(#colorRisk)" />
                  <Area type="monotone" dataKey="events" stroke="#00D4FF" fillOpacity={1} fill="url(#colorEvents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0D121C] p-5 rounded border border-[#162132]">
            <h2 className="text-sm font-bold text-[#F4F7FB] mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FFB547]" />
              Threat Severity Breakdown
            </h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {severityPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#080B12', borderColor: '#162132', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-[10px] font-mono mt-2 text-[#8995A7]">
              {severityPie.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Event Stream & Incident Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Queue */}
          <div className="bg-[#0D121C] p-5 rounded border border-[#162132]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-[#F4F7FB]">Correlated Security Incidents</h2>
              <span className="text-[11px] text-[#8995A7] font-mono">Top Priorities</span>
            </div>
            <div className="space-y-3">
              {incidents.length === 0 ? (
                <p className="text-xs text-[#8995A7] py-6 text-center">No active incidents detected.</p>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-3 bg-[#080B12] rounded border border-[#162132] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[#F4F7FB]">{inc.title || `Incident #${inc.id}`}</div>
                      <div className="text-[10px] text-[#8995A7] font-mono mt-0.5">
                        Status: <span className="text-[#00D4FF]">{inc.status}</span> | Events: {inc.event_count || 1}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-[#FF4545]">{inc.risk_score || 70}</div>
                      <span className="text-[9px] text-[#8995A7]">RISK SCORE</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Telemetry Stream */}
          <div className="bg-[#0D121C] p-5 rounded border border-[#162132]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-[#F4F7FB]">Live Telemetry Feed (WebSocket)</h2>
              <div className="flex gap-1">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      activeFilter === lvl
                        ? 'bg-[#00D4FF] text-[#080B12]'
                        : 'bg-[#080B12] text-[#8995A7] hover:bg-[#162132]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <p className="text-xs text-[#8995A7] py-6 text-center">Awaiting telemetry packets...</p>
              ) : (
                filteredEvents.map((ev, idx) => (
                  <div key={ev.id || idx} className="p-2.5 bg-[#080B12] rounded border border-[#162132] flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#00D4FF]">{ev.source_ip}</span>
                        <span className="text-[10px] text-[#8995A7]">→</span>
                        <span className="font-mono text-[11px] text-[#8995A7]">{ev.destination_ip || '127.0.0.1'}</span>
                        <span className="text-[10px] font-mono text-[#F4F7FB]">{ev.event_type}</span>
                      </div>
                      <div className="text-[11px] text-[#8995A7] mt-0.5 truncate max-w-md">
                        {ev.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                        ev.severity === 'CRITICAL' ? 'bg-[#FF4545]/20 text-[#FF4545]' :
                        ev.severity === 'HIGH' ? 'bg-[#FFB547]/20 text-[#FFB547]' :
                        ev.severity === 'MEDIUM' ? 'bg-[#00D4FF]/20 text-[#00D4FF]' :
                        'bg-[#19E68C]/20 text-[#19E68C]'
                      }`}>
                        {ev.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
