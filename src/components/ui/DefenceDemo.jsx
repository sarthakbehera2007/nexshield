import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Shield } from 'lucide-react';

const REQUESTS = [
  { label: 'Normal Request', id: 'normal', payload: 'GET /api/users/profile HTTP/1.1\nHost: app.nexshield.local\nAuthorization: Bearer eyJhbGc...', result: 'ALLOWED', severity: 'info', rule: null, reason: 'Request matches expected behavioral baseline. Valid JWT token with correct scopes. Source IP within trusted range.' },
  { label: 'SQL Injection', id: 'sqli', payload: "GET /api/search?q=' OR '1'='1'; DROP TABLE users;-- HTTP/1.1\nHost: app.nexshield.local", result: 'BLOCKED', severity: 'critical', rule: 'RULE-SQL-001: Classic SQLI Pattern', reason: "Query parameter contains SQL injection signature: OR '1'='1' and DROP TABLE. Request terminated at gateway. No backend contact." },
  { label: 'XSS Attempt', id: 'xss', payload: 'POST /api/comment HTTP/1.1\nContent-Type: application/json\n\n{"text":"<script>document.cookie=\'x\'+document.cookie</script>"}', result: 'BLOCKED', severity: 'high', rule: 'RULE-XSS-004: Stored XSS Payload', reason: 'Script injection detected in JSON body field. Payload matches stored XSS signature. Content sanitized and event logged.' },
  { label: 'Login Brute Force', id: 'bruteforce', payload: 'POST /auth/login HTTP/1.1\n\n{"username":"admin","password":"[attempt #25/60]"}\n\n[This IP has 24 prior failures in 90s]', result: 'BLOCKED', severity: 'high', rule: 'RULE-AUTH-007: Brute Force Threshold', reason: 'Source IP exceeded 15 failed authentication attempts. Rate limit enforced, temporary IP block applied, security event logged.' },
];

const resultStyle = {
  ALLOWED: { color: '#19E68C', bg: 'rgba(25,230,140,0.08)', border: 'rgba(25,230,140,0.3)', Icon: CheckCircle2 },
  BLOCKED: { color: '#FF3B69', bg: 'rgba(255,59,105,0.08)', border: 'rgba(255,59,105,0.3)', Icon: XCircle },
};

const sevColor = { info: '#19E68C', high: '#F59E0B', critical: '#FF3B69' };

export function DefenceDemo() {
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | inspecting | complete
  const [incidentCount, setIncidentCount] = useState(3);

  const simulate = (req) => {
    setSelected(req);
    setPhase('inspecting');
    setTimeout(() => {
      setPhase('complete');
      if (req.result === 'BLOCKED') setIncidentCount(c => c + 1);
    }, 1800);
  };

  const r = selected;
  const rs = r ? resultStyle[r.result] : null;

  return (
    <section className="py-24 md:py-32 px-5 md:px-8 max-w-7xl mx-auto">
      <div className="mb-14">
        <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ INTERACTIVE DEMO</div>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight">
          SEE DEFENCE<br />IN ACTION.
        </h2>
        <p className="mt-4 text-[#8293A5] text-lg max-w-lg">
          Select a simulated request and watch NEXSHIELD inspect, classify and respond in real time.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-amber-400 bg-amber-400/8 border border-amber-400/20 px-3 py-1 rounded">
          <AlertCircle className="w-3 h-3" /> LOCAL DEMO — Harmless simulation only. No real payloads executed.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request selector */}
        <div className="space-y-3">
          <div className="font-mono text-xs text-[#8293A5] tracking-wider mb-4">SELECT REQUEST TYPE</div>
          {REQUESTS.map(req => (
            <button key={req.id} onClick={() => simulate(req)}
              className="w-full text-left p-4 rounded-xl border transition-all duration-200 group"
              style={{
                borderColor: selected?.id === req.id ? (req.result === 'BLOCKED' ? 'rgba(255,59,105,0.4)' : 'rgba(25,230,140,0.3)') : 'rgba(120,160,190,0.14)',
                backgroundColor: selected?.id === req.id ? (req.result === 'BLOCKED' ? 'rgba(255,59,105,0.05)' : 'rgba(25,230,140,0.05)') : 'transparent',
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-sm font-bold text-white">{req.label}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{ color: sevColor[req.severity], backgroundColor: `${sevColor[req.severity]}12`, border: `1px solid ${sevColor[req.severity]}25` }}>
                  {req.severity.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#8293A5] leading-relaxed bg-[#090F18] rounded-lg p-2.5 whitespace-pre-line group-hover:border-[rgba(120,160,190,0.2)] transition-colors">
                {req.payload.slice(0, 80)}...
              </div>
            </button>
          ))}
        </div>

        {/* Inspection result panel */}
        <div className="bg-[#0D1622] rounded-2xl border border-[rgba(120,160,190,0.14)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[rgba(120,160,190,0.1)] flex items-center justify-between">
            <span className="font-mono text-xs text-[#8293A5] tracking-wider">INSPECTION ENGINE</span>
            <span className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-[#8293A5]">Events logged:</span>
              <span className="text-[#F4F7FB] font-bold">{incidentCount}</span>
            </span>
          </div>

          <div className="flex-1 p-5">
            {!selected && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-40">
                <Shield className="w-10 h-10 text-[#8293A5]" />
                <p className="font-mono text-xs text-[#8293A5] text-center">Select a request type to simulate inspection</p>
              </div>
            )}

            {selected && (
              <div className="space-y-4">
                {/* Gateway animation */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="px-2.5 py-1.5 rounded bg-[#008CFF]/12 border border-[#008CFF]/25 text-[#008CFF]">CLIENT</div>
                  <div className="flex-1 h-px border-t border-dashed border-[rgba(120,160,190,0.25)] relative">
                    {phase === 'inspecting' && (
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00DFFF] animate-bounce" style={{ left: '45%' }} />
                    )}
                  </div>
                  <div className="px-2.5 py-1.5 rounded bg-[#00DFFF]/10 border border-[#00DFFF]/25 text-[#00DFFF]">NEXSHIELD</div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8293A5]" />
                  <div className={`px-2.5 py-1.5 rounded border font-mono text-xs transition-all ${phase === 'complete' && r.result === 'BLOCKED' ? 'bg-[#FF3B69]/10 border-[#FF3B69]/25 text-[#FF3B69] opacity-30' : 'bg-[#090F18] border-[rgba(120,160,190,0.1)] text-[#8293A5]'}`}>APP</div>
                </div>

                {/* Payload display */}
                <div className="bg-[#090F18] rounded-xl p-4 border border-[rgba(120,160,190,0.08)]">
                  <div className="font-mono text-[10px] text-[#8293A5] tracking-wider mb-2">RAW REQUEST</div>
                  <pre className="font-mono text-[11px] text-[#F4F7FB] whitespace-pre-wrap leading-relaxed">{selected.payload}</pre>
                </div>

                {/* Inspection state */}
                {phase === 'inspecting' && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#00DFFF]/06 border border-[#00DFFF]/20">
                    <div className="w-4 h-4 border-2 border-[#00DFFF]/30 border-t-[#00DFFF] rounded-full animate-spin" />
                    <span className="font-mono text-xs text-[#00DFFF]">Inspecting request against 1,240 detection rules...</span>
                  </div>
                )}

                {/* Result */}
                {phase === 'complete' && rs && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: rs.bg, border: `1px solid ${rs.border}` }}>
                      <rs.Icon className="w-5 h-5 shrink-0" style={{ color: rs.color }} />
                      <div>
                        <div className="font-heading font-bold text-base" style={{ color: rs.color }}>{r.result}</div>
                        {r.rule && <div className="font-mono text-[11px] text-[#8293A5]">{r.rule}</div>}
                      </div>
                    </div>
                    <div className="bg-[#090F18] rounded-xl p-4 border border-[rgba(120,160,190,0.08)]">
                      <div className="font-mono text-[10px] text-[#8293A5] tracking-wider mb-2">EXPLANATION</div>
                      <p className="font-mono text-[11px] text-[#F4F7FB] leading-relaxed">{r.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
