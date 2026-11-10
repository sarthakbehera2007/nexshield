import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  {
    id: '01', label: 'OBSERVE', color: '#00DFFF',
    title: 'Network telemetry collection',
    desc: 'Continuous packet inspection, log aggregation and system telemetry across cloud workloads, endpoints, identity providers and OT infrastructure.',
    metrics: ['24,000+ Hosts', '1.4B Events/Day', '12.4 GB/s'],
  },
  {
    id: '02', label: 'DETECT', color: '#008CFF',
    title: 'Identify suspicious activity',
    desc: 'Heuristic behavioral models surface anomalous patterns that signature-based tools miss — zero-day activity, insider threats and low-and-slow attack vectors.',
    metrics: ['99.4% Precision', '0.8ms Latency', 'Zero-Day Ready'],
  },
  {
    id: '03', label: 'CORRELATE', color: '#A78BFA',
    title: 'Connect related events',
    desc: 'The Attack Story Engine links individual security events across time, host and user dimensions into a coherent, human-readable attack narrative.',
    metrics: ['7+ Signal Sources', 'MITRE ATT&CK', 'Graph Correlation'],
  },
  {
    id: '04', label: 'UNDERSTAND', color: '#F59E0B',
    title: 'AI-assisted investigation',
    desc: 'Natural language explanations map each attack stage to evidence. Every decision is explainable, traceable and audit-logged — no black boxes.',
    metrics: ['Explainable AI', 'Evidence Chain', 'Plain Language'],
  },
  {
    id: '05', label: 'DEFEND', color: '#19E68C',
    title: 'Controlled, approval-based response',
    desc: 'Actions require human approval before execution. NEXSHIELD never acts autonomously without operator oversight — surgical containment, not blunt blocking.',
    metrics: ['< 380ms Response', 'Human-in-Loop', 'Zero Collateral'],
  },
];

export function ArchitectureSection() {
  const [activeStage, setActiveStage] = useState(0);
  const sectionRef = useRef();
  const lineRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage(s => (s + 1) % STAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const active = STAGES[activeStage];

  return (
    <section id="architecture" ref={sectionRef} className="py-24 md:py-32 bg-[#090F18] border-y border-[rgba(120,160,190,0.1)]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Heading */}
        <div className="mb-16">
          <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ PLATFORM ARCHITECTURE</div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight">
            FROM SIGNAL<br />TO RESPONSE.
          </h2>
        </div>

        {/* Stage selector — horizontal scrollable pipeline */}
        <div className="relative flex items-start gap-0 mb-12 overflow-x-auto pb-4">
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <button onClick={() => setActiveStage(i)}
                className="flex flex-col items-center gap-3 shrink-0 group min-w-[120px]"
                aria-current={i === activeStage}>
                {/* Circle node */}
                <div className="relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor: i === activeStage ? active.color : 'rgba(120,160,190,0.2)',
                    backgroundColor: i === activeStage ? `${active.color}15` : 'transparent',
                    boxShadow: i === activeStage ? `0 0 20px ${active.color}30` : 'none',
                  }}>
                  <span className="font-mono text-xs font-bold" style={{ color: i === activeStage ? active.color : '#8293A5' }}>
                    {stage.id}
                  </span>
                  {i === activeStage && (
                    <div className="absolute inset-0 rounded-full border-2 animate-ping opacity-30"
                      style={{ borderColor: active.color }} />
                  )}
                </div>
                <span className="font-mono text-[11px] font-semibold tracking-widest"
                  style={{ color: i === activeStage ? active.color : '#8293A5' }}>
                  {stage.label}
                </span>
              </button>

              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div className="flex-1 h-px mt-6 min-w-[32px] transition-all duration-500"
                  style={{ backgroundColor: i < activeStage ? active.color : 'rgba(120,160,190,0.15)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Active stage detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="transition-all duration-300">
            <div className="font-heading text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ color: '#F4F7FB' }}>
              <span style={{ color: active.color }}>{active.id} — {active.label}:</span><br />
              {active.title}
            </div>
            <p className="text-[#8293A5] leading-relaxed text-base mb-6">{active.desc}</p>
            <div className="flex flex-wrap gap-2">
              {active.metrics.map(m => (
                <span key={m} className="px-3 py-1 rounded-full font-mono text-xs border"
                  style={{ color: active.color, borderColor: `${active.color}35`, backgroundColor: `${active.color}08` }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Visual diagram */}
          <div className="relative bg-[#0D1622] rounded-xl border border-[rgba(120,160,190,0.1)] p-6 h-48 flex items-center justify-center overflow-hidden">
            <div className="relative flex items-center gap-6">
              {STAGES.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300"
                    style={{
                      borderColor: i <= activeStage ? s.color : 'rgba(120,160,190,0.15)',
                      backgroundColor: i === activeStage ? `${s.color}20` : i < activeStage ? `${s.color}08` : 'transparent',
                    }}>
                    <span className="font-mono text-[9px] font-bold" style={{ color: i <= activeStage ? s.color : '#8293A5' }}>{s.id}</span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="hidden md:block absolute left-0" />
                  )}
                </div>
              ))}
            </div>
            {/* Background pattern */}
            <div className="absolute inset-0 dot-grid opacity-30 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
