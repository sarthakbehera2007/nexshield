import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Terminal, Play, Shield } from 'lucide-react';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Platform', href: '#showcase' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Security', href: '#security' },
];

export function Navbar({ onWatchDemo, onLaunchConsole, isThreatActive, isDefenseActive, activeView, onViewChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef();
  const mobileMenuRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    } else {
      gsap.to(mobileMenuRef.current, { opacity: 0, y: -8, duration: 0.18, ease: 'power2.in' });
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#05080E]/92 backdrop-blur-md border-b border-[rgba(120,160,190,0.14)] py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-7 h-7">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                <path d="M12 2L4 6V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V6L12 2Z"
                  fill="#05080E" stroke="#00DFFF" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8.5 8.5V15.5M8.5 8.5L15.5 15.5M15.5 8.5V15.5"
                  stroke="#00DFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="font-heading text-[15px] font-bold tracking-widest text-white leading-none">
                NEXSHIELD
              </div>
              <div className="font-mono text-[9px] tracking-widest text-[#8293A5] leading-none mt-0.5">
                v5.0 · ENTERPRISE
              </div>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <button
              onClick={() => onViewChange && onViewChange('home')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                activeView === 'home' ? 'bg-[#00DFFF]/15 text-[#00DFFF] border border-[#00DFFF]/30' : 'text-[#8293A5] hover:text-white'
              }`}
            >
              HOME
            </button>
            <button
              onClick={() => onViewChange && onViewChange('soc')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                activeView === 'soc' ? 'bg-[#00DFFF]/15 text-[#00DFFF] border border-[#00DFFF]/30' : 'text-[#8293A5] hover:text-white'
              }`}
            >
              LIVE SOC
            </button>
            <button
              onClick={() => onViewChange && onViewChange('defence')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                activeView === 'defence' ? 'bg-[#00DFFF]/15 text-[#00DFFF] border border-[#00DFFF]/30' : 'text-[#8293A5] hover:text-white'
              }`}
            >
              DEFENCE CENTER
            </button>
            <button
              onClick={() => onViewChange && onViewChange('honeypot')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                activeView === 'honeypot' ? 'bg-[#19E68C]/15 text-[#19E68C] border border-[#19E68C]/30' : 'text-[#8293A5] hover:text-white'
              }`}
            >
              HONEYPOT
            </button>
            <button
              onClick={() => onViewChange && onViewChange('mobile-gateway')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                activeView === 'mobile-gateway' ? 'bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30' : 'text-[#8293A5] hover:text-white'
              }`}
            >
              MOBILE GATEWAY
            </button>
            <button
              onClick={() => onViewChange && onViewChange('mobile-app')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                activeView === 'mobile-app' ? 'bg-[#FFB547]/15 text-[#FFB547] border border-[#FFB547]/30' : 'text-[#8293A5] hover:text-white'
              }`}
            >
              MOBILE APP
            </button>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-[#8293A5] border border-[rgba(120,160,190,0.14)] px-3 py-1.5 rounded-lg">
            <span className={`w-1.5 h-1.5 rounded-full ${isThreatActive ? 'bg-rose-500 animate-ping' : isDefenseActive ? 'bg-[#19E68C]' : 'bg-[#19E68C]'}`} />
            {isThreatActive ? 'BREACH DETECTED' : isDefenseActive ? 'DEFENDING' : 'LAB ONLINE'}
          </div>

          {/* Watch Demo */}
          <button onClick={onWatchDemo}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#F4F7FB] border border-[rgba(120,160,190,0.18)] hover:border-[rgba(0,223,255,0.35)] hover:text-white transition-all bg-transparent hover:bg-white/5">
            <Play className="w-3.5 h-3.5 text-[#00DFFF]" />
            Watch Demo
          </button>

          {/* Launch Console CTA */}
          <button onClick={onLaunchConsole}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#00DFFF] hover:bg-[#33E8FF] text-[#05080E] transition-all shadow-[0_0_20px_rgba(0,223,255,0.25)] hover:shadow-[0_0_28px_rgba(0,223,255,0.4)]">
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Console</span>
            <span className="sm:hidden">Console</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden p-2 text-[#8293A5] hover:text-white transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen nav */}
      {mobileOpen && (
        <div ref={mobileMenuRef}
          className="fixed inset-0 z-40 bg-[#05080E]/98 backdrop-blur-xl pt-20 px-6 flex flex-col gap-2 lg:hidden overflow-y-auto">
          <div className="flex flex-col gap-1 pb-4 border-b border-[rgba(120,160,190,0.1)]">
            <button
              onClick={() => { onViewChange && onViewChange('home'); setMobileOpen(false); }}
              className="text-left font-mono font-bold text-white py-2"
            >
              HOME
            </button>
            <button
              onClick={() => { onViewChange && onViewChange('soc'); setMobileOpen(false); }}
              className="text-left font-mono font-bold text-[#00DFFF] py-2"
            >
              LIVE SOC DASHBOARD
            </button>
            <button
              onClick={() => { onViewChange && onViewChange('defence'); setMobileOpen(false); }}
              className="text-left font-mono font-bold text-[#00DFFF] py-2"
            >
              DEFENCE CENTER
            </button>
            <button
              onClick={() => { onViewChange && onViewChange('honeypot'); setMobileOpen(false); }}
              className="text-left font-mono font-bold text-[#19E68C] py-2"
            >
              HONEYPOT CENTER
            </button>
            <button
              onClick={() => { onViewChange && onViewChange('mobile-gateway'); setMobileOpen(false); }}
              className="text-left font-mono font-bold text-[#00D4FF] py-2"
            >
              MOBILE GATEWAY
            </button>
            <button
              onClick={() => { onViewChange && onViewChange('mobile-app'); setMobileOpen(false); }}
              className="text-left font-mono font-bold text-[#FFB547] py-2"
            >
              MOBILE APP (PWA)
            </button>
          </div>
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-lg font-heading font-medium text-[#8293A5] hover:text-white py-2 transition-colors">
              {link.label}
            </a>
          ))}
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => { onWatchDemo(); setMobileOpen(false); }}
              className="w-full py-3.5 rounded-xl border border-[rgba(120,160,190,0.18)] text-white font-semibold flex items-center justify-center gap-2">
              <Play className="w-4 h-4 text-[#00DFFF]" /> Watch Demo
            </button>
            <button onClick={() => { onLaunchConsole(); setMobileOpen(false); }}
              className="w-full py-3.5 rounded-xl bg-[#00DFFF] text-[#05080E] font-bold flex items-center justify-center gap-2">
              <Terminal className="w-4 h-4" /> Launch Console
            </button>
          </div>
        </div>
      )}
    </>
  );
}
