import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Loader2, Info, Shield, AlertCircle } from 'lucide-react';

const INCIDENT = {
  id: 'NX-9821', score: 94, label: 'Critical',
  type: 'SSH Brute Force + Persistence',
  host: 'ssh-gateway.internal',
  source: '185.220.101.47',
  time: '23:12 – 23:17',
  events: 6, affected: 3,
};

const SAMPLE_CONVERSATIONS = [
  {
    q: 'Explain what happened.',
    a: `Multiple reconnaissance requests from 185.220.101.47 were followed by 24 repeated authentication failures targeting admin@ssh-gateway. After gaining access, the attacker modified /etc/passwd and /etc/sudoers to establish persistence. The activity maps to MITRE ATT\&CK techniques T1110.001 (Brute Force: Password Spraying), T1098 (Account Manipulation), and T1136 (Create Account).`,
  },
  {
    q: 'How confident are you this is a real attack?',
    a: `Confidence score: 0.96 / 1.0. The correlation across 6 events, consistent source IP, known TOR exit node association, rapid post-auth file modification, and behavioral deviation from the account's 180-day baseline all strongly indicate a genuine intrusion attempt rather than a misconfiguration or false positive.`,
  },
  {
    q: 'What should I do now?',
    a: `Recommended actions (in priority order):\n1. Block 185.220.101.47 at all gateway layers\n2. Terminate and invalidate session SSH-9821-B immediately\n3. Revert /etc/passwd and /etc/sudoers to last known-good state\n4. Force MFA re-enrolment for the admin account\n5. Preserve memory dump and log artifacts for forensic chain-of-custody\n\nAll actions require your explicit approval before execution.`,
  },
];

export function CopilotPreview() {
  const [chatIdx, setChatIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef();

  const convo = SAMPLE_CONVERSATIONS[chatIdx % SAMPLE_CONVERSATIONS.length];

  useEffect(() => {
    setMessages([]);
    setIsTyping(false);
    // Trigger question after short delay
    const t1 = setTimeout(() => {
      setMessages([{ role: 'user', text: convo.q }]);
      setIsTyping(true);
    }, 400);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, { role: 'ai', text: convo.a }]);
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [chatIdx]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  return (
    <section className="py-24 md:py-32 bg-[#090F18] border-y border-[rgba(120,160,190,0.1)]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="mb-14">
          <div className="font-mono text-xs text-[#00DFFF] tracking-widest mb-3">/ AI SECURITY COPILOT</div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight">
            YOUR ANALYST.<br />ALWAYS ON DUTY.
          </h2>
          <p className="mt-4 text-[#8293A5] text-lg max-w-lg">
            Ask questions in plain language. Get evidence-backed, explainable answers — not black-box verdicts.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-[#8293A5] bg-[#8293A5]/8 border border-[#8293A5]/20 px-3 py-1 rounded">
            <Info className="w-3 h-3" /> SIMULATED AI RESPONSE — Not connected to production backend
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Incident panel */}
          <div className="bg-[#0D1622] rounded-2xl border border-[rgba(120,160,190,0.14)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(120,160,190,0.1)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8293A5] tracking-wider">INCIDENT CONTEXT</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF3B69]/12 text-[#FF3B69] border border-[#FF3B69]/25">CRITICAL</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Threat score dial */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,59,105,0.1)" strokeWidth="6" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#FF3B69" strokeWidth="6"
                      strokeDasharray={`${(INCIDENT.score / 100) * 163.4} 163.4`}
                      strokeLinecap="round" />
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
                  { l: 'ATT&CK Mapping', v: 'T1110.001, T1098' },
                ].map(item => (
                  <div key={item.l} className="bg-[#090F18] rounded-lg p-3">
                    <div className="font-mono text-[10px] text-[#8293A5] mb-1">{item.l}</div>
                    <div className="font-mono text-xs text-[#F4F7FB] font-semibold">{item.v}</div>
                  </div>
                ))}
              </div>

              {/* Quick questions */}
              <div>
                <div className="font-mono text-[10px] text-[#8293A5] tracking-wider mb-2">SUGGESTED QUESTIONS</div>
                <div className="space-y-1.5">
                  {SAMPLE_CONVERSATIONS.map((c, i) => (
                    <button key={i} onClick={() => setChatIdx(i)}
                      className="w-full text-left px-3 py-2.5 rounded-lg border transition-all text-xs font-mono"
                      style={{
                        borderColor: i === chatIdx % SAMPLE_CONVERSATIONS.length ? 'rgba(0,223,255,0.35)' : 'rgba(120,160,190,0.1)',
                        color: i === chatIdx % SAMPLE_CONVERSATIONS.length ? '#00DFFF' : '#8293A5',
                        backgroundColor: i === chatIdx % SAMPLE_CONVERSATIONS.length ? 'rgba(0,223,255,0.06)' : 'transparent',
                      }}>
                      "{c.q}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat interface */}
          <div className="bg-[#0D1622] rounded-2xl border border-[rgba(120,160,190,0.14)] overflow-hidden flex flex-col h-[520px]">
            <div className="px-5 py-4 border-b border-[rgba(120,160,190,0.1)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00DFFF]/12 border border-[#00DFFF]/25 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#00DFFF]" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-[#F4F7FB]">NEXSHIELD AI COPILOT</div>
                <div className="font-mono text-[10px] text-[#8293A5]">Incident Investigation Mode</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-40">
                  <Bot className="w-8 h-8 text-[#8293A5]" />
                  <p className="font-mono text-xs text-[#8293A5]">Select a question to begin the investigation</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-[#008CFF]/15 border border-[#008CFF]/25' : 'bg-[#00DFFF]/12 border border-[#00DFFF]/25'}`}>
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5 text-[#008CFF]" />
                      : <Bot className="w-3.5 h-3.5 text-[#00DFFF]" />}
                  </div>
                  <div className={`max-w-[80%] rounded-xl p-3.5 font-mono text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#008CFF]/12 text-[#F4F7FB] border border-[#008CFF]/20'
                      : 'bg-[#090F18] text-[#F4F7FB] border border-[rgba(120,160,190,0.1)]'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#00DFFF]/12 border border-[#00DFFF]/25 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#00DFFF]" />
                  </div>
                  <div className="bg-[#090F18] rounded-xl px-4 py-3 border border-[rgba(120,160,190,0.1)]">
                    <Loader2 className="w-4 h-4 text-[#00DFFF] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="px-4 py-3.5 border-t border-[rgba(120,160,190,0.1)]">
              <div className="flex items-center gap-3 bg-[#090F18] rounded-xl px-4 py-3 border border-[rgba(120,160,190,0.1)]">
                <input readOnly value={messages.find(m => m.role === 'user')?.text || 'Ask a question about this incident...'}
                  className="flex-1 bg-transparent font-mono text-xs text-[#8293A5] outline-none cursor-default" />
                <Shield className="w-4 h-4 text-[#00DFFF] shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
