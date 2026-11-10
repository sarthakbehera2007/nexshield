import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle } from 'lucide-react';

// Interactive Demo Fallback — animated platform walkthrough
function InteractiveDemo() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: '01 / NETWORK RECONNAISSANCE', color: '#8293A5', desc: 'Scanning 24,000+ hosts across 18 network segments. Baseline telemetry established.', indicator: 'MONITORING' },
    { label: '02 / SUSPICIOUS REQUEST DETECTED', color: '#00DFFF', desc: 'Unusual authentication probe from 185.220.101.47 targeting admin endpoint. Heuristic score: 0.84.', indicator: 'ALERT' },
    { label: '03 / ATTACK CORRELATION', color: '#F59E0B', desc: 'NEXSHIELD correlates 7 related events across 3 hosts into a single incident timeline.', indicator: 'CORRELATING' },
    { label: '04 / AI INVESTIGATION', color: '#A78BFA', desc: 'AI maps attack chain: Initial probe → Auth failure × 12 → Lateral movement attempt. MITRE T1110.001.', indicator: 'ANALYZING' },
    { label: '05 / DEFENCE APPROVAL', color: '#19E68C', desc: 'Recommendation: Block source IP, revoke active sessions, enforce MFA. Awaiting operator approval.', indicator: 'PENDING' },
    { label: '06 / THREAT CONTAINED', color: '#19E68C', desc: 'Session tokens revoked in 14ms. IP blocked at gateway. Incident closed. Zero data exfiltrated.', indicator: 'CONTAINED' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-[#05080E] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[rgba(120,160,190,0.12)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#00DFFF] tracking-widest font-semibold">NEXSHIELD PLATFORM</span>
          <span className="px-2 py-0.5 rounded bg-[#00DFFF]/10 border border-[#00DFFF]/30 text-[#00DFFF] font-mono text-[10px]">DEMO PREVIEW</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#8293A5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#19E68C] animate-pulse" />
          SIMULATED ENVIRONMENT
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Step indicator */}
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8' : 'w-2'}`}
              style={{ backgroundColor: i === step ? s.color : 'rgba(130,147,165,0.3)' }} />
          ))}
        </div>

        {/* Current step display */}
        <div className="max-w-lg w-full bg-[#0D1622] rounded-xl border border-[rgba(120,160,190,0.14)] p-6 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-xs tracking-wider font-bold" style={{ color: steps[step].color }}>
              {steps[step].label}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border"
              style={{ color: steps[step].color, borderColor: `${steps[step].color}40`, backgroundColor: `${steps[step].color}10` }}>
              {steps[step].indicator}
            </span>
          </div>

          <p className="text-[#8293A5] text-sm leading-relaxed mb-4">{steps[step].desc}</p>

          {/* Simulated log stream */}
          <div className="bg-[#090F18] rounded-lg p-3 font-mono text-[11px] text-[#19E68C] leading-relaxed">
            <div className="text-[#8293A5]">&gt; nexshield query --incident NX-{9000 + step * 11} --format json</div>
            <div className="text-[#00DFFF]">Fetching incident data...</div>
            <div>status: <span style={{ color: steps[step].color }}>{steps[step].indicator.toLowerCase()}</span></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-lg h-px bg-[rgba(120,160,190,0.1)] rounded-full overflow-hidden">
          <div className="h-full bg-[#00DFFF] transition-all duration-700 ease-linear"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

export function VideoModal({ isOpen, onClose }) {
  const overlayRef = useRef();
  const modalRef = useRef();
  const videoRef = useRef();
  const [videoExists, setVideoExists] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Check video existence
  useEffect(() => {
    if (!isOpen) return;
    fetch('/videos/nexshield-demo.mp4', { method: 'HEAD' })
      .then(r => setVideoExists(r.ok))
      .catch(() => setVideoExists(false));
  }, [isOpen]);

  // GSAP entrance / exit
  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { opacity: 0, y: 24, scale: 0.96 });
      gsap.timeline()
        .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
        .to(modalRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }, '-=0.15');
    }
  }, [isOpen, videoExists]);

  const handleClose = () => {
    if (videoRef.current) { videoRef.current.pause(); setIsPlaying(false); }
    if (overlayRef.current && modalRef.current) {
      gsap.timeline({ onComplete: onClose })
        .to(modalRef.current, { opacity: 0, y: 16, scale: 0.97, duration: 0.25, ease: 'power2.in' })
        .to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play(); setIsPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/92 backdrop-blur-md">
      <div ref={modalRef} className="relative w-full max-w-5xl bg-[#05080E] rounded-2xl overflow-hidden border border-[rgba(120,160,190,0.18)] shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(120,160,190,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-[#00DFFF]/10 border border-[#00DFFF]/30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 border-t border-r border-[#00DFFF] rounded-sm" />
            </div>
            <span className="font-mono text-xs text-[#F4F7FB] tracking-widest font-semibold">NEXSHIELD</span>
            <span className="font-mono text-xs text-[#8293A5]">/ Platform Overview</span>
            {videoExists === false && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 font-mono text-[10px] text-amber-400">DEMO PREVIEW</span>
            )}
          </div>
          <button onClick={handleClose} className="p-1.5 rounded text-[#8293A5] hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Demo content area */}
        <div className="relative bg-black aspect-video">
          {videoExists === true ? (
            <>
              <video
                ref={videoRef}
                src="/videos/nexshield-demo.mp4"
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
              />
              {/* Click-to-play overlay */}
              {!isPlaying && (
                <button onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-16 h-16 rounded-full bg-[#00DFFF]/15 border border-[#00DFFF]/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#00DFFF]/25 transition-all">
                    <Play className="w-7 h-7 text-[#00DFFF] ml-1" />
                  </div>
                </button>
              )}
              {/* Controls bar */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 bg-gradient-to-t from-black/90">
                <div className="w-full h-1 bg-white/10 rounded-full mb-3 cursor-pointer" onClick={handleSeek}>
                  <div className="h-full bg-[#00DFFF] rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="text-white hover:text-[#00DFFF] transition-colors">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setIsMuted(m => !m); if (videoRef.current) videoRef.current.muted = !isMuted; }}
                    className="text-white hover:text-[#00DFFF] transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="font-mono text-[11px] text-white/50 ml-auto">
                    {Math.floor((progress / 100) * duration)}s / {Math.floor(duration)}s
                  </span>
                  <button className="text-white hover:text-[#00DFFF] transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : videoExists === false ? (
            <InteractiveDemo />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-[#00DFFF]/30 border-t-[#00DFFF] rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
