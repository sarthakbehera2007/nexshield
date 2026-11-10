import React, { useRef, useEffect } from 'react';
import { Terminal, Play, ArrowRight, Zap } from 'lucide-react';
import gsap from 'gsap';

export function HeroContent({ onWatchDemo, onLaunchConsole }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.fromTo('[data-hero="tag"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        .fromTo('[data-hero="h1"]', { opacity: 0, y: 24, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.07 }, '-=0.2')
        .fromTo('[data-hero="copy"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.3')
        .fromTo('[data-hero="cta"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 }, '-=0.25')
        .fromTo('[data-hero="status"]', { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.3');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col justify-center max-w-xl xl:max-w-2xl w-full select-none">
      {/* Classification tag */}
      <div data-hero="tag" className="flex items-center gap-2 mb-7">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,223,255,0.25)] bg-[rgba(0,223,255,0.06)] font-mono text-xs text-[#00DFFF] tracking-wider">
          <Zap className="w-3 h-3" />
          DETECT. UNDERSTAND. DEFEND.
        </span>
      </div>

      {/* Main heading */}
      <div className="mb-6 space-y-1">
        <h1 data-hero="h1" className="font-heading text-5xl sm:text-6xl xl:text-7xl font-extrabold text-white leading-[1.04] tracking-tight">
          SEE THE THREAT.
        </h1>
        <h1 data-hero="h1" className="font-heading text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.04] tracking-tight"
          style={{ background: 'linear-gradient(135deg, #00DFFF 0%, #008CFF 60%, #19E68C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          STOP THE BREACH.
        </h1>
      </div>

      {/* Supporting copy */}
      <p data-hero="copy" className="text-[#8293A5] text-base md:text-lg leading-relaxed mb-9 max-w-lg">
        Transform security signals into actionable intelligence. Detect suspicious activity, connect attack sequences and enable explainable, controlled cyber defence.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button data-hero="cta" onClick={onLaunchConsole}
          className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00DFFF] hover:bg-[#33E8FF] text-[#05080E] font-semibold text-sm transition-all shadow-[0_0_28px_rgba(0,223,255,0.3)] hover:shadow-[0_0_40px_rgba(0,223,255,0.45)]">
          <Terminal className="w-4 h-4" />
          LAUNCH CONSOLE
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button data-hero="cta" onClick={onWatchDemo}
          className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-[rgba(120,160,190,0.22)] bg-[rgba(13,22,34,0.6)] text-[#F4F7FB] hover:border-[rgba(0,223,255,0.35)] hover:text-white font-semibold text-sm transition-all">
          <Play className="w-4 h-4 text-[#00DFFF]" />
          WATCH PLATFORM DEMO
        </button>
      </div>

      {/* Status bar */}
      <div data-hero="status" className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-[rgba(120,160,190,0.1)]">
        {[
          { dot: '#19E68C', label: 'NETWORK SENSOR', value: 'ACTIVE', sub: 'DEMO' },
          { dot: '#00DFFF', label: 'THREAT ENGINE', value: 'READY', sub: 'DEMO' },
          { dot: '#F59E0B', label: 'DEFENCE MODE', value: 'APPROVAL REQUIRED', sub: null },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot, boxShadow: `0 0 8px ${s.dot}` }} />
            <div className="font-mono text-[11px] leading-tight">
              <div className="text-[#8293A5]">{s.label}</div>
              <div className="text-[#F4F7FB] font-semibold">
                {s.value}
                {s.sub && <span className="text-[#8293A5] font-normal ml-1.5">({s.sub})</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
