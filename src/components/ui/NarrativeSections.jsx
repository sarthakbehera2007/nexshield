import React from 'react';
import { HeroContent } from './HeroContent';
import {
  Radar,
  Activity,
  Layers,
  Network,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Terminal,
  Lock,
  Cpu,
  CheckCircle2,
  FileCode,
  Share2
} from 'lucide-react';

export function NarrativeSections({
  heroRef,
  onLaunchConsole,
  onExplorePlatform,
  currentSection,
}) {
  return (
    <div className="relative z-10 w-full pointer-events-none">
      {/* SECTION 1 — HERO */}
      <section
        ref={heroRef}
        className="scroll-section min-h-screen w-full flex items-center px-6 md:px-12 lg:px-20 pt-24 pb-16 pointer-events-auto"
      >
        <HeroContent
          onLaunchClick={onLaunchConsole}
          onExploreClick={onExplorePlatform}
        />
      </section>

      {/* SECTION 2 — INTELLIGENCE */}
      <section className="scroll-section min-h-screen w-full flex items-center px-6 md:px-12 lg:px-20 py-24 pointer-events-auto">
        <div className="max-w-xl cyber-panel bracket-corners p-8 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              02 / COGNITIVE TELEMETRY
            </span>
            <span className="font-mono text-xs text-slate-500 tracking-wider">
              ROTATION: +15° ACCELERATED
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            THREATS DON'T<br />
            <span className="text-cyan-400">ANNOUNCE THEMSELVES.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Adversaries exploit blind spots between disconnected point tools. NEXSHIELD unifies unstructured telemetry across cloud workloads, endpoints, identity providers, and zero-day threat streams into a synchronized behavioral model.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-2.5">
              <Radar className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <div>
                <div className="text-xs font-mono font-bold text-white">Continuous Posture</div>
                <div className="text-[11px] text-slate-400">Zero-latency graph ingestion</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-teal-400 shrink-0 mt-1" />
              <div>
                <div className="text-xs font-mono font-bold text-white">Heuristic Mapping</div>
                <div className="text-[11px] text-slate-400">Machine-learned intent decoding</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — DETECTION */}
      <section className="scroll-section min-h-screen w-full flex items-center px-6 md:px-12 lg:px-20 py-24 pointer-events-auto">
        <div className="max-w-xl cyber-panel bracket-corners p-8 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              03 / SIGNAL RECONSTRUCTION
            </span>
            <span className="font-mono text-xs text-emerald-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              INSPECTION CORE ACTIVE
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            DETECT<br />
            <span className="text-cyan-400">EVERY SIGNAL.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Filter out noise without missing subtle lateral probes. Internal N-circuit conduit layers parse 100M+ events per second with sub-millisecond precision, isolating anomalies while normal traffic flows seamlessly.
          </p>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Ingestion Throughput
              </span>
              <span className="text-cyan-300 font-bold">12.4 GB/s Realtime</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                False Positive Attenuation
              </span>
              <span className="text-emerald-400 font-bold">99.4% Suppressed</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — INVESTIGATION */}
      <section className="scroll-section min-h-screen w-full flex items-center justify-end px-6 md:px-12 lg:px-20 py-24 pointer-events-auto">
        <div className="max-w-xl cyber-panel-alert bracket-corners p-8 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
              04 / FORENSIC GRAPH CORRELATION
            </span>
            <span className="font-mono text-xs text-rose-400 tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              ATTACK VECTOR TRACED
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            CONNECT<br />
            <span className="text-rose-400">THE ATTACK.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Understand the complete storyline. NEXSHIELD links root cause, malicious privilege escalations, C2 beaconing, and credential access into an interactive timeline mapped directly to MITRE ATT&CK techniques.
          </p>

          {/* Interactive Attack Timeline Card */}
          <div className="p-4 rounded bg-slate-950/90 border border-rose-500/30 space-y-3 font-mono text-xs">
            <div className="text-[11px] text-slate-400 tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
              <span>SUSPECT INCIDENT #NX-9821</span>
              <span className="text-rose-400 font-bold">SEV-1 CRITICAL</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500">23:14:02</span>
                <span className="text-slate-300">Initial ingress via compromised SSH key</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500">23:14:19</span>
                <span className="text-amber-300">Privilege escalation attempt: sudo token replay</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-slate-500">23:14:45</span>
                <span className="text-rose-400 font-bold">Lateral movement probe to Database Shard 04</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — DEFENCE */}
      <section className="scroll-section min-h-screen w-full flex items-center px-6 md:px-12 lg:px-20 py-24 pointer-events-auto">
        <div className="max-w-xl cyber-panel bracket-corners p-8 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              05 / SURGICAL CONTAINMENT
            </span>
            <span className="font-mono text-xs text-emerald-400 tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              PERIMETER STABILIZED
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            STOP<br />
            <span className="text-emerald-400">THE BREACH.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Autonomous counter-measures execute in milliseconds. NEXSHIELD revokes compromised session tokens, isolates targeted pods, and applies micro-segmentation policies before any exfiltration occurs.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-slate-950/70 border border-emerald-500/30">
              <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Token Revocation
              </div>
              <div className="text-[11px] text-slate-400">Completed in 14ms</div>
            </div>

            <div className="p-3 rounded bg-slate-950/70 border border-emerald-500/30">
              <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Defensive Shield
              </div>
              <div className="text-[11px] text-slate-400">Perimeter locked</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="scroll-section min-h-screen w-full flex items-center justify-center px-6 md:px-12 lg:px-20 py-24 pointer-events-auto">
        <div className="max-w-2xl text-center cyber-panel bracket-corners p-10 rounded-xl relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-mono text-xs mb-6">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            READY FOR ENTERPRISE DEPLOYMENT
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-white mb-4">
            INTELLIGENCE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              THAT DEFENDS.
            </span>
          </h2>

          <p className="text-slate-300 text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Protect your global hybrid infrastructure with the world’s most advanced explainable AI cyber defense system. Deploy in under 15 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button
              onClick={onLaunchConsole}
              className="px-8 py-3.5 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Cloud Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplorePlatform}
              className="px-8 py-3.5 rounded bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-cyan-400 font-mono font-semibold text-sm tracking-wider uppercase transition-all duration-200"
            >
              Request Enterprise Architecture Brief
            </button>
          </div>

          {/* Compliance & Trust Badges */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span>SOC2 TYPE II CERTIFIED</span>
            <span>•</span>
            <span>ISO 27001 READY</span>
            <span>•</span>
            <span>FEDRAMP MODERATE</span>
            <span>•</span>
            <span>POST-QUANTUM CRYPTOGRAPHY</span>
          </div>
        </div>
      </section>
    </div>
  );
}
