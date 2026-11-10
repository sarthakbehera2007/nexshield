import React, { useRef, useEffect } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export function FinalCTA({ onLaunchConsole, onExplore }) {
  const ctaRef = useRef();

  useEffect(() => {
    if (!ctaRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-cta]', {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 80%' },
        opacity: 0,
        y: 28,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ctaRef} className="py-32 md:py-40 px-5 md:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,223,255,0.055) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <div data-cta className="font-mono text-xs text-[#00DFFF] tracking-widest mb-6">/ NEXSHIELD v5.0</div>

        <h2 data-cta className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.04] tracking-tight mb-6">
          THE NEXT MOVE<br />IS DEFENCE.
        </h2>

        <p data-cta className="text-[#8293A5] text-xl leading-relaxed mb-12 max-w-xl mx-auto">
          Turn disconnected security signals into actionable intelligence. Detect, understand, and defend — with full transparency.
        </p>

        <div data-cta className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onLaunchConsole}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#00DFFF] hover:bg-[#33E8FF] text-[#05080E] font-bold text-base transition-all shadow-[0_0_40px_rgba(0,223,255,0.35)] hover:shadow-[0_0_55px_rgba(0,223,255,0.5)]">
            <Terminal className="w-5 h-5" />
            LAUNCH NEXSHIELD
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button onClick={onExplore}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border border-[rgba(120,160,190,0.22)] hover:border-[rgba(0,223,255,0.35)] text-white font-semibold text-base transition-all hover:bg-white/5">
            EXPLORE THE PLATFORM
          </button>
        </div>

        <div data-cta className="mt-14 pt-10 border-t border-[rgba(120,160,190,0.1)] font-mono text-xs text-[#8293A5] flex flex-wrap items-center justify-center gap-6">
          <span>Offline-First Architecture</span>
          <span className="opacity-30">·</span>
          <span>Human-Approved Response</span>
          <span className="opacity-30">·</span>
          <span>Explainable AI Detection</span>
          <span className="opacity-30">·</span>
          <span>Full Audit Preservation</span>
        </div>
      </div>
    </section>
  );
}
