import React from 'react';
import { CheckCircle2, Shield, Database, Eye, Clock, FileText } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, color: '#00DFFF', label: 'Local Monitoring', desc: 'All detection processing runs locally in your environment. No signals are sent to external servers without your consent.' },
  { icon: Database, color: '#19E68C', label: 'Offline-First Architecture', desc: 'Core detection capabilities function without an internet connection. No dependency on third-party cloud availability.' },
  { icon: FileText, color: '#A78BFA', label: 'Evidence Preservation', desc: 'All incident events, raw payloads and investigation context are preserved in tamper-evident audit storage.' },
  { icon: Eye, color: '#008CFF', label: 'Explainable Decisions', desc: 'Every detection alert includes structured evidence, detection rule reference, confidence score and plain-language rationale.' },
  { icon: Clock, color: '#F59E0B', label: 'Approval-Based Response', desc: 'No autonomous action is taken without explicit operator approval. NEXSHIELD recommends — humans decide.' },
  { icon: CheckCircle2, color: '#19E68C', label: 'Full Audit History', desc: 'Every investigation step, analyst action and system decision is logged with timestamps and operator identity.' },
];

export function TrustSection() {
  return (
    <section id="security" className="py-24 md:py-32 px-5 md:px-8 max-w-7xl mx-auto">
      <div className="mb-14">
        <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ PLATFORM PRINCIPLES</div>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl">
          BUILT ON TRANSPARENCY AND CONTROL.
        </h2>
        <p className="mt-4 text-[#8293A5] text-lg max-w-lg leading-relaxed">
          NEXSHIELD is designed from the ground up around operator trust, evidence transparency and human oversight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="group p-6 rounded-2xl border border-[rgba(120,160,190,0.1)] hover:border-[rgba(120,160,190,0.22)] transition-all">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="font-heading text-base font-bold text-white mb-2">{item.label}</div>
                <p className="text-[#8293A5] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
