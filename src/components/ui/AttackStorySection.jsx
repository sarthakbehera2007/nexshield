import React, { useState } from 'react';
import { ChevronRight, AlertCircle, AlertTriangle, Info, Shield, CheckCircle2, ArrowDown } from 'lucide-react';

const EVENTS = [
  {
    time: '23:12:04', label: 'NETWORK RECONNAISSANCE',
    type: 'RECON', sev: 'low', ip: '185.220.101.47',
    summary: 'Systematic port scan of perimeter hosts. 3,200 probes across 24 hosts.',
    evidence: ['Probe count: 3,200 in 60s', 'Target range: 10.0.0.1–10.0.0.24', 'Tool fingerprint: nmap SYN scan', 'Geolocation: TOR Exit Node'],
    icon: Info, color: '#8293A5',
  },
  {
    time: '23:14:17', label: 'REPEATED AUTH FAILURES',
    type: 'BRUTE-FORCE', sev: 'medium', ip: '185.220.101.47',
    summary: '24 failed SSH login attempts against admin account in 90 seconds.',
    evidence: ['24 failures in 90s', 'Target: admin@ssh-gateway', 'Password spraying pattern', 'Same source IP as RECON'],
    icon: AlertCircle, color: '#00DFFF',
  },
  {
    time: '23:14:45', label: 'SUSPICIOUS REQUEST',
    type: 'INTRUSION', sev: 'high', ip: '185.220.101.47',
    summary: 'Successful auth using valid credential. Session established from suspicious IP.',
    evidence: ['Auth success after 24 failures', 'First login from this geolocation', 'Credential: admin@ssh-gateway', 'Session ID: SSH-9821-B'],
    icon: AlertTriangle, color: '#F59E0B',
  },
  {
    time: '23:16:02', label: 'FILE INTEGRITY ALERT',
    type: 'TAMPER', sev: 'high', ip: '10.0.0.5 (internal)',
    summary: '/etc/passwd and /etc/sudoers modified within active session.',
    evidence: ['Modified: /etc/passwd (root entry added)', 'Modified: /etc/sudoers', 'SHA256 hash mismatch confirmed', 'Correlated to session SSH-9821-B'],
    icon: AlertTriangle, color: '#F59E0B',
  },
  {
    time: '23:17:30', label: 'CORRELATED INCIDENT',
    type: 'INCIDENT', sev: 'critical', ip: 'Multi-host',
    summary: 'NEXSHIELD correlates 4 events into Incident NX-9821. MITRE T1110.001, T1098, T1136.',
    evidence: ['Attack chain: Recon → BruteForce → Intrusion → Persistence', 'Confidence score: 0.96', 'ATT&CK: T1110.001, T1098, T1136', 'Related hosts: 3'],
    icon: AlertCircle, color: '#FF3B69',
  },
  {
    time: '23:17:44', label: 'DEFENCE ACTION',
    type: 'RESPONSE', sev: 'info', ip: 'All affected',
    summary: 'Operator approved: Block IP, revoke session, enforce MFA. Completed in 14ms.',
    evidence: ['IP 185.220.101.47 blocked at gateway', 'Session SSH-9821-B terminated', 'Admin account MFA enforced', 'All contained. Zero exfiltration.'],
    icon: CheckCircle2, color: '#19E68C',
  },
];

const sevBg = { low: '#8293A508', medium: '#00DFFF08', high: '#F59E0B10', critical: '#FF3B6912', info: '#19E68C10' };
const sevBorder = { low: 'rgba(130,147,165,0.2)', medium: 'rgba(0,223,255,0.25)', high: 'rgba(245,158,11,0.3)', critical: 'rgba(255,59,105,0.4)', info: 'rgba(25,230,140,0.3)' };

export function AttackStorySection() {
  const [selected, setSelected] = useState(0);
  const event = EVENTS[selected];

  return (
    <section className="py-24 md:py-32 px-5 md:px-8 max-w-7xl mx-auto">
      <div className="mb-14">
        <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ ATTACK STORY ENGINE</div>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight">
          ONE ATTACK.<br />CONNECTED INTELLIGENCE.
        </h2>
        <p className="mt-4 text-[#8293A5] text-lg max-w-lg">
          Every event connected. Every step explained. Click each stage to inspect the evidence.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-3 py-1 rounded">
          <Info className="w-3 h-3" /> INCIDENT NX-9821 — DEMO DATA
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Timeline column */}
        <div className="space-y-1">
          {EVENTS.map((e, i) => {
            const Icon = e.icon;
            const isActive = i === selected;
            return (
              <div key={i}>
                <button
                  onClick={() => setSelected(i)}
                  className="w-full text-left p-4 rounded-xl border transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? sevBg[e.sev] : 'transparent',
                    borderColor: isActive ? sevBorder[e.sev] : 'rgba(120,160,190,0.1)',
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5"
                      style={{ borderColor: isActive ? e.color : 'rgba(120,160,190,0.15)', backgroundColor: isActive ? `${e.color}18` : 'transparent' }}>
                      <Icon className="w-4 h-4" style={{ color: isActive ? e.color : '#8293A5' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color: e.color }}>{e.type}</span>
                        <span className="font-mono text-[10px] text-[#8293A5]">{e.time}</span>
                      </div>
                      <div className="font-heading text-sm font-semibold text-white">{e.label}</div>
                      {isActive && (
                        <p className="mt-1.5 text-[#8293A5] text-xs leading-relaxed">{e.summary}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 mt-1 transition-transform" style={{ color: '#8293A5', transform: isActive ? 'rotate(90deg)' : 'none' }} />
                  </div>
                </button>
                {i < EVENTS.length - 1 && (
                  <div className="flex justify-start ml-7.5 pl-[14px]">
                    <ArrowDown className="w-3.5 h-3.5" style={{ color: i < selected ? event.color : 'rgba(120,160,190,0.2)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="sticky top-24 bg-[#0D1622] rounded-2xl border border-[rgba(120,160,190,0.14)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(120,160,190,0.1)] flex items-center justify-between">
            <span className="font-mono text-xs text-[#8293A5]">EVENT DETAIL — DEMO</span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
              style={{ color: event.color, backgroundColor: `${event.color}15`, border: `1px solid ${event.color}30` }}>
              {event.type}
            </span>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <div className="font-heading text-lg font-bold text-white mb-1">{event.label}</div>
              <div className="font-mono text-xs text-[#8293A5] mb-3">
                Source IP: <span className="text-[#F4F7FB]">{event.ip}</span>
                &nbsp;·&nbsp; Time: <span className="text-[#F4F7FB]">{event.time}</span>
              </div>
              <p className="text-[#8293A5] text-sm leading-relaxed">{event.summary}</p>
            </div>

            <div>
              <div className="font-mono text-[10px] text-[#8293A5] tracking-wider mb-3">EVIDENCE CHAIN</div>
              <div className="space-y-2">
                {event.evidence.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 font-mono text-xs">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                    <span className="text-[#F4F7FB] leading-relaxed">{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {event.sev === 'critical' && (
              <div className="bg-[#FF3B69]/8 border border-[#FF3B69]/25 rounded-xl p-4">
                <div className="font-mono text-[10px] text-[#FF3B69] tracking-wider mb-1">NEXSHIELD RECOMMENDATION</div>
                <div className="text-sm text-[#F4F7FB] leading-relaxed">
                  Isolate session, block source IP, revoke privileged credentials, and trigger forensic preservation.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
