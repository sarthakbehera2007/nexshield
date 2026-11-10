import React, { useState, useEffect } from 'react';
import { X, Terminal, Shield, AlertTriangle, CheckCircle, RefreshCw, Zap, Server, Database, Globe } from 'lucide-react';

export function ConsoleModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([
    { time: '23:40:01', level: 'INFO', msg: 'Core quantum cryptographic handshake verified.' },
    { time: '23:40:04', level: 'SYS', msg: 'Shield perimeter telemetry connected (56 physical nodes).' },
    { time: '23:40:07', level: 'INFO', msg: 'Zero-day behavioral anomaly model version 4.8.2 primed.' },
    { time: '23:40:11', level: 'OK', msg: 'Continuous packet inspection active across multi-cloud edge.' },
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const msgs = [
        'Heuristic inspection: 48,209 packets analyzed, zero anomalies detected.',
        'Endpoint session check: 12,840 active authenticated sessions verified.',
        'Kubernetes pod network isolation policy synchronized.',
        'DNS tunneling heuristic score: 0.002 (safe threshold < 0.15).',
        'TLS 1.3 session resumption key rotated successfully.',
        'eBPF kernel probe telemetry stream heartbeat received: 0.8ms.',
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs((prev) => [...prev.slice(-7), { time: timeStr, level: 'LIVE', msg: randomMsg }]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl cyber-panel bracket-corners rounded-xl overflow-hidden shadow-2xl border border-cyan-500/40">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
              NEXSHIELD CLOUD DEFENCE CONSOLE // SESSION: ROOT_SEC
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LIVE
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Globe className="w-3 h-3 text-cyan-400" /> Cloud Regions
              </div>
              <div className="text-sm font-bold text-white">18 Multi-Zone</div>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Server className="w-3 h-3 text-emerald-400" /> Monitored Assets
              </div>
              <div className="text-sm font-bold text-white">142,500 Nodes</div>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3 h-3 text-purple-400" /> Signal Ingestion
              </div>
              <div className="text-sm font-bold text-cyan-300">1.4B Events/Day</div>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Zap className="w-3 h-3 text-amber-400" /> Mean Time to Defend
              </div>
              <div className="text-sm font-bold text-emerald-400">&lt; 380 ms</div>
            </div>
          </div>

          {/* Live Telemetry Stream */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                KERNEL TELEMETRY LOG STREAM
              </span>
              <span className="text-[10px]">BUFFER: 1024 KB FIFO</span>
            </div>

            <div className="p-4 rounded bg-slate-950/95 border border-slate-800 space-y-1.5 font-mono text-[11px] h-48 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-slate-600">{log.time}</span>
                  <span
                    className={`font-bold px-1 rounded text-[9px] ${
                      log.level === 'OK' || log.level === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : log.level === 'SYS'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Enforcer */}
          <div className="p-4 rounded bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Autonomous Quarantine Policy</div>
              <div className="text-slate-400 text-[11px]">
                Enforce micro-segmentation upon high-confidence MITRE ATT&CK correlation.
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider text-[10px]">
              ENFORCING
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
