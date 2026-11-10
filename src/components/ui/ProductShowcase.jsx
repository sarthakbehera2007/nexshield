import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { AlertTriangle, Shield, Wifi, Activity, ChevronRight, Clock } from 'lucide-react';

const trafficData = [
  { t: '00:00', normal: 420, suspicious: 8 },
  { t: '04:00', normal: 280, suspicious: 12 },
  { t: '08:00', normal: 760, suspicious: 24 },
  { t: '10:30', normal: 940, suspicious: 71 },
  { t: '12:00', normal: 1080, suspicious: 48 },
  { t: '14:00', normal: 870, suspicious: 36 },
  { t: '16:00', normal: 1120, suspicious: 180 },
  { t: '17:45', normal: 990, suspicious: 420 },
  { t: '20:00', normal: 650, suspicious: 55 },
  { t: '23:00', normal: 380, suspicious: 18 },
];

const severityData = [
  { name: 'Critical', count: 3, color: '#FF3B69' },
  { name: 'High', count: 11, color: '#F59E0B' },
  { name: 'Medium', count: 28, color: '#00DFFF' },
  { name: 'Low', count: 64, color: '#19E68C' },
  { name: 'Info', count: 142, color: '#8293A5' },
];

const eventFeed = [
  { time: '17:46:02', type: 'INTRUSION', msg: 'Auth bruteforce from 185.220.101.47 — 24 failures', sev: 'critical', new: true },
  { time: '17:45:58', type: 'ANOMALY', msg: 'Unusual outbound TLS on port 8443 — host WEB-07', sev: 'high', new: true },
  { time: '17:45:41', type: 'MALWARE', msg: 'C2 beacon pattern detected — ENDPOINT-14', sev: 'critical', new: false },
  { time: '17:44:19', type: 'RECON', msg: 'Port scan from 10.0.0.52 — 3200 probes in 60s', sev: 'medium', new: false },
  { time: '17:43:07', type: 'POLICY', msg: 'Lateral movement attempt — SRV-02 → DB-SHARD-04', sev: 'high', new: false },
  { time: '17:42:55', type: 'AUTH', msg: 'Privileged account login from new geolocation', sev: 'medium', new: false },
];

const sevColor = { critical: '#FF3B69', high: '#F59E0B', medium: '#00DFFF', low: '#19E68C', info: '#8293A5' };

export function ProductShowcase() {
  const [tick, setTick] = useState(0);
  const sectionRef = useRef();

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="showcase" ref={sectionRef} className="py-24 md:py-32 px-5 md:px-8 max-w-7xl mx-auto">
      {/* Section heading */}
      <div className="mb-14">
        <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ SOC OPERATIONS</div>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl">
          VISIBILITY ACROSS YOUR ATTACK SURFACE.
        </h2>
        <p className="mt-4 text-[#8293A5] text-lg max-w-lg leading-relaxed">
          A unified operations view, bringing every signal into one coherent threat picture.
        </p>
      </div>

      {/* Dashboard card — 3D perspective on scroll handled by CSS transform */}
      <div className="relative rounded-2xl overflow-hidden border border-[rgba(120,160,190,0.14)] bg-[#090F18] shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        style={{ perspective: '1800px' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(120,160,190,0.1)] bg-[#0D1622]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {['#FF5F5A', '#FEBC2E', '#28C840'].map(c => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="font-mono text-[11px] text-[#8293A5]">NEXSHIELD / Security Operations Centre</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8293A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            LIVE · {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="p-5 grid grid-cols-12 gap-4">
          {/* Stat cards */}
          {[
            { label: 'Active Incidents', value: '14', delta: '+3', c: '#FF3B69', icon: AlertTriangle },
            { label: 'Critical Threats', value: '3', delta: 'SEV-1', c: '#F59E0B', icon: Shield },
            { label: 'Network Sensors', value: '56', delta: 'ALL ONLINE', c: '#19E68C', icon: Wifi },
            { label: 'Events / Minute', value: '24.8K', delta: 'PEAK', c: '#00DFFF', icon: Activity },
          ].map((s, i) => (
            <div key={i} className="col-span-6 md:col-span-3 bg-[#0D1622] rounded-xl p-4 border border-[rgba(120,160,190,0.1)]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-[#8293A5] tracking-wider">{s.label}</span>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.c }} />
              </div>
              <div className="font-heading text-2xl font-bold text-white">{s.value}</div>
              <div className="font-mono text-[11px] mt-1" style={{ color: s.c }}>{s.delta}</div>
            </div>
          ))}

          {/* Traffic chart */}
          <div className="col-span-12 md:col-span-7 bg-[#0D1622] rounded-xl p-4 border border-[rgba(120,160,190,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#8293A5] tracking-wider">NETWORK TRAFFIC — 24H</span>
              <span className="flex items-center gap-3 font-mono text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#008CFF]" />Normal</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#FF3B69]" />Suspicious</span>
              </span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008CFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#008CFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSusp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B69" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF3B69" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#8293A5', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8293A5', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D1622', border: '1px solid rgba(120,160,190,0.14)', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Area type="monotone" dataKey="normal" stroke="#008CFF" strokeWidth={1.5} fill="url(#gNormal)" dot={false} />
                <Area type="monotone" dataKey="suspicious" stroke="#FF3B69" strokeWidth={1.5} fill="url(#gSusp)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Severity bar chart */}
          <div className="col-span-12 md:col-span-5 bg-[#0D1622] rounded-xl p-4 border border-[rgba(120,160,190,0.1)]">
            <div className="mb-4 font-mono text-xs text-[#8293A5] tracking-wider">SEVERITY BREAKDOWN</div>
            <div className="space-y-2.5">
              {severityData.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#8293A5] w-16 shrink-0">{s.name}</span>
                  <div className="flex-1 h-1.5 bg-[#090F18] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(s.count / 142) * 100}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-white w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Event Feed */}
          <div className="col-span-12 bg-[#0D1622] rounded-xl border border-[rgba(120,160,190,0.1)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(120,160,190,0.08)] flex items-center justify-between">
              <span className="font-mono text-xs text-[#8293A5] tracking-wider">SECURITY EVENT FEED</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#19E68C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#19E68C] animate-pulse" /> STREAMING
              </span>
            </div>
            <div className="divide-y divide-[rgba(120,160,190,0.07)]">
              {eventFeed.map((e, i) => (
                <div key={i} className={`flex items-start gap-4 px-4 py-3 font-mono text-xs hover:bg-white/[0.015] transition-colors ${e.new ? 'bg-[rgba(0,223,255,0.03)]' : ''}`}>
                  <span className="text-[#8293A5] shrink-0 mt-0.5">{e.time}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0"
                    style={{ backgroundColor: `${sevColor[e.sev]}18`, color: sevColor[e.sev] }}>
                    {e.type}
                  </span>
                  <span className="text-[#F4F7FB] flex-1 leading-relaxed">{e.msg}</span>
                  {e.new && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#00DFFF]/10 border border-[#00DFFF]/20 text-[#00DFFF] text-[9px] font-bold">NEW</span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-[#8293A5] shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
