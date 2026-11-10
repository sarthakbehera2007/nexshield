import React from 'react';
import { Radio, Crosshair, Cpu, HardDrive, Wifi, Activity } from 'lucide-react';

export function TelemetryOverlay({
  currentSection = 0,
  isThreatDetected = false,
  isDefending = false,
}) {
  const sections = [
    '01 // HERO CORE',
    '02 // INTELLIGENCE',
    '03 // DETECTION',
    '04 // INVESTIGATION',
    '05 // DEFENCE',
    '06 // PRODUCTION',
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* Top Left Telemetry Coordinate Box */}
      <div className="absolute top-16 left-6 md:left-12 hidden md:flex flex-col gap-1 font-mono text-[10px] text-slate-500">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>NEXUS-GRID // SECTOR 07-A</span>
        </div>
        <div className="tracking-widest">LAT: 37°46'29.7"N | LON: 122°25'09.9"W</div>
        <div className="text-slate-400">HARDWARE SHIELD: TITANIUM-GRAPHITE MATRIX</div>
      </div>

      {/* Top Right Live Vector Monitor */}
      <div className="absolute top-16 right-6 md:right-12 hidden md:flex flex-col items-end gap-1 font-mono text-[10px] text-slate-500">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span>DATA STREAM: 2.4 TB/s</span>
        </div>
        <div className="text-slate-400">
          STATUS: <span className={isThreatDetected ? 'text-rose-400 font-bold' : isDefending ? 'text-emerald-400 font-bold' : 'text-cyan-300 font-bold'}>
            {isThreatDetected ? 'CONTAINMENT PROTOCOL ACTIVE' : isDefending ? 'SURGICAL ISOLATION LOCKED' : 'NORMAL INGESTION'}
          </span>
        </div>
        <div>ENTROPY BUFFER: 99.998% QUANTUM SYNC</div>
      </div>

      {/* Bottom Left Status Deck */}
      <div className="absolute bottom-6 left-6 md:left-12 flex flex-col gap-1 font-mono text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
            <span className={`w-1.5 h-1.5 rounded-full ${isThreatDetected ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} />
            <span>AI CORE: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>MESH NODES: 56/56 ONLINE</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Scroll Progress Navigator */}
      <div className="absolute bottom-6 right-6 md:right-12 flex items-center gap-3 font-mono text-[11px] text-slate-400">
        <div className="px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/20 text-cyan-300 font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{sections[currentSection] || sections[0]}</span>
        </div>
      </div>
    </div>
  );
}
