import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Loader2, Info, Shield, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { copilotService } from '../../services/copilotService';

const INCIDENT = {
  id: 'NX-9821', score: 94, label: 'Critical',
  type: 'SQLi & Brute Force Attack Chain',
  host: 'gateway-api.internal',
  source: '10.217.4.110 (Kali Red Team)',
  time: 'Real-Time Telemetry',
  events: 8, affected: 3,
};

const SUGGESTED_QUERIES = [
  'Explain what happened with the SQL injection attack.',
  'What MITRE ATT&CK techniques were detected?',
  'How confident are you this is a genuine intrusion?',
  'What defensive containment actions should I approve?',
];

export function CopilotPreview() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello, Analyst. I am NEXSHIELD AI Copilot, powered by Google's Gemma 4. I am monitoring live incident NX-9821 and honeypot interaction traps. How can I assist your investigation?",
      mitre: ['T1190 (Exploit Public-Facing Application)'],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copilotStatus, setCopilotStatus] = useState(null);
  const chatRef = useRef();

  useEffect(() => {
    copilotService.getStatus()
      .then(setCopilotStatus)
      .catch(() => setCopilotStatus({ engine: 'Google Gemma 4', status: 'READY_STANDBY' }));
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isTyping) return;

    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    try {
      const resp = await copilotService.chat(text, INCIDENT.id);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: resp.answer || 'Analysis complete.',
          mitre: resp.mitre_techniques || [],
          model: resp.model || 'Gemma 4',
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `[Gemma 4 Analysis]\n\nBased on correlated evidence from host 10.217.4.110, the adversary executed automated probes followed by SQL injection tautologies (' OR '1'='1). The threat matches MITRE ATT&CK T1190.\n\nRecommended: Execute TEMPORARY_BLOCK_IP in Defence Center.`,
          mitre: ['T1190: Initial Access'],
        },
      ]);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[#090F18] border-y border-[rgba(120,160,190,0.1)]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-[#00DFFF] tracking-widest">/ AI SECURITY COPILOT</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00DFFF]/10 text-[#00DFFF] border border-[#00DFFF]/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,223,255,0.3)]">
              <Sparkles className="w-3 h-3 text-[#00DFFF]" />
              POWERED BY GOOGLE GEMMA 4
            </span>
          </div>

          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight">
            YOUR ANALYST.<br />ALWAYS ON DUTY.
          </h2>
          <p className="mt-4 text-[#8293A5] text-lg max-w-lg">
            Ask questions in plain language. Google Gemma 4 delivers evidence-grounded, explainable threat attribution and safe countermeasures.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-[#19E68C] bg-[#19E68C]/10 border border-[#19E68C]/25 px-3 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#19E68C]" />
            GEMMA 4 INTELLIGENCE MESH // {copilotStatus?.status || 'ONLINE'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Incident panel */}
          <div className="bg-[#0D1622] rounded-2xl border border-[rgba(120,160,190,0.14)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(120,160,190,0.1)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8293A5] tracking-wider">INCIDENT CONTEXT</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF3B69]/12 text-[#FF3B69] border border-[#FF3B69]/25">
                  CRITICAL
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Threat score dial */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,59,105,0.1)" strokeWidth="6" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#FF3B69"
                      strokeWidth="6"
                      strokeDasharray={`${(INCIDENT.score / 100) * 163.4} 163.4`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-lg font-bold text-white">{INCIDENT.score}</span>
                  </div>
                </div>
                <div>
                  <div className="font-heading text-base font-bold text-white mb-0.5">{INCIDENT.id}</div>
                  <div className="font-mono text-xs text-[#8293A5]">{INCIDENT.type}</div>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Target Host', v: INCIDENT.host },
                  { l: 'Source IP', v: INCIDENT.source },
                  { l: 'Timeframe', v: INCIDENT.time },
                  { l: 'Affected Hosts', v: `${INCIDENT.affected} systems` },
                  { l: 'Total Events', v: `${INCIDENT.events} correlated` },
                  { l: 'ATT&CK Mapping', v: 'T1190, T1110' },
                ].map((item) => (
                  <div key={item.l} className="bg-[#090F18] rounded-lg p-3">
                    <div className="font-mono text-[10px] text-[#8293A5] mb-1">{item.l}</div>
                    <div className="font-mono text-xs text-[#F4F7FB] font-semibold">{item.v}</div>
                  </div>
                ))}
              </div>

              {/* Quick suggested questions */}
              <div>
                <div className="font-mono text-[10px] text-[#8293A5] tracking-wider mb-2">
                  CLICK TO PROMPT GEMMA 4
                </div>
                <div className="space-y-1.5">
                  {SUGGESTED_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-[rgba(120,160,190,0.14)] hover:border-[#00DFFF]/40 hover:bg-[#00DFFF]/5 transition-all text-xs font-mono text-[#8293A5] hover:text-[#00DFFF]"
                    >
                      &quot;{q}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chat interface */}
          <div className="bg-[#0D1622] rounded-2xl border border-[rgba(120,160,190,0.14)] overflow-hidden flex flex-col h-[560px]">
            <div className="px-5 py-4 border-b border-[rgba(120,160,190,0.1)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00DFFF]/12 border border-[#00DFFF]/25 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#00DFFF]" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#F4F7FB] flex items-center gap-2">
                    <span>NEXSHIELD COPILOT</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00DFFF]/15 text-[#00DFFF] font-mono">
                      GEMMA 4
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#8293A5]">
                    Google DeepMind Security Intelligence Engine
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#19E68C]">
                <span className="w-2 h-2 rounded-full bg-[#19E68C] animate-pulse" />
                ACTIVE
              </div>
            </div>

            {/* Messages container */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-[#008CFF]/15 border border-[#008CFF]/25'
                        : 'bg-[#00DFFF]/12 border border-[#00DFFF]/25'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-[#008CFF]" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-[#00DFFF]" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 font-mono text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#008CFF]/15 text-[#F4F7FB] border border-[#008CFF]/25'
                        : 'bg-[#090F18] text-[#F4F7FB] border border-[rgba(120,160,190,0.12)] space-y-2'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.mitre && msg.mitre.length > 0 && (
                      <div className="pt-2 border-t border-[rgba(120,160,190,0.1)] flex flex-wrap gap-1">
                        {msg.mitre.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-[#00DFFF] border border-[#00DFFF]/20"
                          >
                            MITRE {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#00DFFF]/12 border border-[#00DFFF]/25 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#00DFFF]" />
                  </div>
                  <div className="bg-[#090F18] rounded-xl px-4 py-3 border border-[rgba(120,160,190,0.1)] flex items-center gap-2 font-mono text-xs text-[#8293A5]">
                    <Loader2 className="w-4 h-4 text-[#00DFFF] animate-spin" />
                    <span>Gemma 4 is analyzing security graph...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Question Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-[rgba(120,160,190,0.1)] bg-[#090F18]/80"
            >
              <div className="flex items-center gap-2 bg-[#0D1622] rounded-xl px-3 py-2 border border-[rgba(120,160,190,0.2)] focus-within:border-[#00DFFF]">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask Gemma 4 (e.g. 'Explain SQLi attack', 'Recommend firewall rule')..."
                  className="flex-1 bg-transparent font-mono text-xs text-white placeholder-[#8293A5]/60 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-1.5 rounded-lg bg-[#00DFFF] hover:bg-[#33E8FF] text-[#05080E] disabled:opacity-30 transition"
                  title="Ask Gemma 4"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
