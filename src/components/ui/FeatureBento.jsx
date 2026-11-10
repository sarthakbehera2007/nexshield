import React from 'react';
import { Radar, GitBranch, Bot, TrendingUp, CheckCircle2, Shield, Eye, Smartphone } from 'lucide-react';

const FEATURES = [
  {
    id: 'detect',
    icon: Radar,
    label: 'Intelligent Network Detection',
    desc: 'Real-time packet inspection and behavioral baselining across cloud, on-premises and OT environments. Zero-day capable.',
    color: '#00DFFF',
    size: 'lg',
    visual: 'radar',
  },
  {
    id: 'story',
    icon: GitBranch,
    label: 'Attack Story Engine',
    desc: 'Correlate disparate events into a cohesive attack narrative mapped to MITRE ATT&CK.',
    color: '#A78BFA',
    size: 'md',
    visual: 'timeline',
  },
  {
    id: 'copilot',
    icon: Bot,
    label: 'AI Security Copilot',
    desc: 'Natural language incident investigation with evidence citations and explainable reasoning.',
    color: '#008CFF',
    size: 'md',
    visual: 'chat',
  },
  {
    id: 'scoring',
    icon: TrendingUp,
    label: 'Predictive Threat Scoring',
    desc: 'Multi-dimensional risk scoring across identity, network and asset context.',
    color: '#F59E0B',
    size: 'sm',
    visual: 'score',
  },
  {
    id: 'approval',
    icon: CheckCircle2,
    label: 'Approval-Based Defence',
    desc: 'Every autonomous action requires human approval. Full audit trail preserved.',
    color: '#19E68C',
    size: 'sm',
    visual: 'approval',
  },
  {
    id: 'honeypot',
    icon: Shield,
    label: 'Digital Honeypot',
    desc: 'Deception-based detection. Adversaries reveal themselves by interacting with decoy assets.',
    color: '#FF3B69',
    size: 'sm',
    visual: 'honeypot',
  },
  {
    id: 'explain',
    icon: Eye,
    label: 'Explainable Detection',
    desc: 'Every alert comes with structured evidence, detection rationale and analyst-readable context.',
    color: '#00DFFF',
    size: 'sm',
    visual: 'explain',
  },
  {
    id: 'mobile',
    icon: Smartphone,
    label: 'Mobile Security Gateway',
    desc: 'Extend detection coverage to mobile endpoints and BYOD with lightweight agent deployment.',
    color: '#8293A5',
    size: 'sm',
    visual: 'mobile',
  },
];

// Tiny animated micro-visualizations per feature
function FeatureVisual({ visual, color }) {
  if (visual === 'radar') {
    return (
      <div className="relative w-16 h-16 flex items-center justify-center">
        {[0.9, 0.65, 0.4].map((s, i) => (
          <div key={i} className="absolute rounded-full border"
            style={{ width: `${s * 64}px`, height: `${s * 64}px`, borderColor: `${color}${30 + i * 10}`, animation: `ping ${1.5 + i * 0.5}s linear infinite`, opacity: 0.4 }} />
        ))}
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>
    );
  }
  if (visual === 'score') {
    return (
      <svg viewBox="0 0 48 48" className="w-14 h-14">
        <circle cx="24" cy="24" r="18" fill="none" stroke={`${color}20`} strokeWidth="5" />
        <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray="88 113" strokeLinecap="round" strokeDashoffset="-28" />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">94</text>
      </svg>
    );
  }
  if (visual === 'approval') {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="px-2.5 py-1 rounded-lg border font-mono text-[9px] font-bold" style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>PENDING APPROVAL</div>
        <div className="w-16 h-px" style={{ backgroundColor: `${color}30` }} />
        <div className="flex gap-2">
          <div className="px-2 py-0.5 rounded bg-[#19E68C]/15 border border-[#19E68C]/30 font-mono text-[9px] text-[#19E68C]">APPROVE</div>
          <div className="px-2 py-0.5 rounded bg-[#FF3B69]/10 border border-[#FF3B69]/25 font-mono text-[9px] text-[#FF3B69]">DENY</div>
        </div>
      </div>
    );
  }
  // Generic icon fallback
  return null;
}

export function FeatureBento() {
  return (
    <section id="capabilities" className="py-24 md:py-32 bg-[#090F18] border-y border-[rgba(120,160,190,0.1)]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="mb-14">
          <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ PLATFORM CAPABILITIES</div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight">
            THE COMPLETE<br />SECURITY STACK.
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Large featured card — 2×2 */}
          <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2 p-6 md:p-8 rounded-2xl border border-[rgba(120,160,190,0.14)] bg-[#0D1622] flex flex-col justify-between min-h-[280px] hover:border-[rgba(0,223,255,0.25)] transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: `${FEATURES[0].color}12`, border: `1px solid ${FEATURES[0].color}25` }}>
                <Radar className="w-5 h-5" style={{ color: FEATURES[0].color }} />
              </div>
              <div className="font-heading text-xl font-bold text-white mb-2">{FEATURES[0].label}</div>
              <p className="text-[#8293A5] text-sm leading-relaxed">{FEATURES[0].desc}</p>
            </div>
            {/* Animated radar visualization */}
            <div className="flex items-center justify-center mt-6 h-20 relative">
              {[1.0, 0.75, 0.5, 0.25].map((s, i) => (
                <div key={i} className="absolute rounded-full border"
                  style={{ width: `${s * 80}px`, height: `${s * 80}px`, borderColor: `${FEATURES[0].color}${25 - i * 5}` }} />
              ))}
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: FEATURES[0].color }} />
              {/* Sweep line */}
              <div className="absolute w-10 h-px origin-left" style={{ backgroundColor: `${FEATURES[0].color}60`, animation: 'spin 3s linear infinite', transformOrigin: 'left center', left: '50%', top: '50%' }} />
              {/* Blips */}
              {[[18, -20], [-22, 8], [10, 24]].map(([x, y], i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === 0 ? '#FF3B69' : '#19E68C', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }} />
              ))}
            </div>
          </div>

          {/* Medium cards */}
          {FEATURES.slice(1, 3).map(f => (
            <div key={f.id} className="p-5 rounded-2xl border border-[rgba(120,160,190,0.14)] bg-[#0D1622] flex flex-col gap-4 hover:border-[rgba(120,160,190,0.25)] transition-all group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <div>
                <div className="font-heading text-base font-bold text-white mb-1.5">{f.label}</div>
                <p className="text-[#8293A5] text-sm leading-relaxed">{f.desc}</p>
              </div>
              <FeatureVisual visual={f.visual} color={f.color} />
            </div>
          ))}

          {/* Small cards */}
          {FEATURES.slice(3).map(f => (
            <div key={f.id} className="p-5 rounded-2xl border border-[rgba(120,160,190,0.14)] bg-[#0D1622] flex flex-col gap-3 hover:border-[rgba(120,160,190,0.22)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}20` }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <div>
                <div className="font-heading text-sm font-bold text-white mb-1">{f.label}</div>
                <p className="text-[#8293A5] text-xs leading-relaxed">{f.desc}</p>
              </div>
              <FeatureVisual visual={f.visual} color={f.color} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
