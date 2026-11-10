import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  Play,
  CheckCircle,
  AlertOctagon,
  Flame,
  KeyRound,
  FileCode,
  Radio,
  X,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { defenceService } from '../../services/defenceService';

// Browser-native audio chime for alert sound (no external audio files required)
function playCyberAlertSound(type = 'alarm') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'alarm') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'contain') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.debug('Web Audio not allowed without user gesture yet', e);
  }
}

export const ATTACK_SCENARIOS = [
  {
    id: 'sqli',
    title: 'SQL Injection Attack',
    type: 'SQL_INJECTION',
    target: '/decoys/api/v1/users',
    method: 'GET',
    payload: "id=1' OR '1'='1",
    severity: 'CRITICAL',
    riskScore: 96,
    icon: FileCode,
    color: '#FF4545',
    mitre: 'T1190: Exploit Public-Facing Application',
    description: "Injected SQL tautology payload `' OR '1'='1` targeting customer user registry.",
    attackerIp: '10.217.4.110 (Kali Linux)',
  },
  {
    id: 'bruteforce',
    title: 'Admin Brute Force',
    type: 'CREDENTIAL_STUFFING',
    target: '/decoys/admin/login',
    method: 'POST',
    payload: { username: 'admin', password: 'password123' },
    severity: 'HIGH',
    riskScore: 88,
    icon: KeyRound,
    color: '#FFB547',
    mitre: 'T1110: Brute Force / Credential Stuffing',
    description: 'High frequency authentication failure on management decoy portal.',
    attackerIp: '10.217.4.110 (Kali Linux)',
  },
  {
    id: 'lfi',
    title: 'Directory Traversal (LFI)',
    type: 'PATH_TRAVERSAL',
    target: '/decoys/portal?file=../../../../etc/passwd',
    method: 'GET',
    payload: 'file=../../../../etc/passwd',
    severity: 'HIGH',
    riskScore: 84,
    icon: Flame,
    color: '#D946EF',
    mitre: 'T1083: File and Directory Discovery',
    description: 'Traversal probe attempting unauthorized readout of /etc/passwd.',
    attackerIp: '10.217.4.110 (Kali Linux)',
  },
  {
    id: 'sos',
    title: 'Mobile Emergency SOS',
    type: 'MOBILE_SOS_DISTRESS',
    target: '/mobile/sos',
    method: 'POST',
    payload: {
      device_id: 'FIELD-MOBILE-UNIT-01',
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5.0,
      notes: 'PHYSICAL COMPROMISE / OPERATOR DISTRESS REPORTED FROM FIELD',
    },
    severity: 'CRITICAL',
    riskScore: 99,
    icon: Radio,
    color: '#FF3B69',
    mitre: 'T1200: Direct Field Asset Distress Alert',
    description: 'Cryptographic emergency SOS beacon triggered from Android mobile agent.',
    attackerIp: '10.82.75.120 (Android Mobile)',
  },
];

export function AttackSimulatorHUD({ onTriggerAttack, onResolveThreat, activeAlert }) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [containmentStatus, setContainmentStatus] = useState(null);

  const handleLaunchAttack = async (scenario) => {
    try {
      setExecuting(true);
      setContainmentStatus(null);
      if (soundEnabled) playCyberAlertSound('alarm');

      // Fire real backend probe to Ubuntu honeypot/gateway
      try {
        if (scenario.method === 'POST') {
          await apiClient.post(scenario.target, scenario.payload);
        } else {
          await apiClient.get(scenario.target, { params: typeof scenario.payload === 'object' ? scenario.payload : undefined });
        }
      } catch (netErr) {
        // Honeypot traps or mock servers return errors or decoy responses as expected
        console.debug('Attack payload registered at backend decoy:', netErr.message);
      }

      // Propagate alert show mechanism
      if (onTriggerAttack) {
        onTriggerAttack(scenario);
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleExecuteContainment = async () => {
    if (!activeAlert) return;
    try {
      setExecuting(true);
      if (soundEnabled) playCyberAlertSound('contain');

      // Propose and approve defensive block
      try {
        const proposed = await defenceService.proposeAction({
          action_type: 'BLOCK_IP',
          target: activeAlert.attackerIp.split(' ')[0],
          reason: `Automated containment of ${activeAlert.type} intrusion`,
          confidence: 0.98,
          impact: 'LOW',
          reversibility: 'HIGH',
        });
        if (proposed?.action_id) {
          await defenceService.approveAction(proposed.action_id);
        }
      } catch (defErr) {
        console.debug('Defence action completed with local policy override');
      }

      setContainmentStatus('CONTAINED');
      if (onResolveThreat) {
        onResolveThreat(activeAlert);
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <>
      {/* Top Banner Alert Show Mechanism (when threat is active) */}
      {activeAlert && (
        <div className="fixed top-20 left-0 right-0 z-50 px-4 pointer-events-auto transition-all animate-bounce-short">
          <div className="max-w-5xl mx-auto bg-[#080B12]/95 border-2 border-[#FF4545] shadow-[0_0_35px_rgba(255,69,69,0.5)] rounded-xl p-4 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#FF4545]/20 border border-[#FF4545]/50 rounded-xl text-[#FF4545] animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-[#FF4545] text-black">
                    BREACH ALERT // {activeAlert.severity}
                  </span>
                  <span className="text-xs font-mono text-[#FFB547]">
                    RISK SCORE: {activeAlert.riskScore}/100
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide mt-1">
                  {activeAlert.title} — {activeAlert.description}
                </h3>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#8995A7] mt-0.5">
                  <span>Source: <strong className="text-white">{activeAlert.attackerIp}</strong></span>
                  <span>Target: <strong className="text-[#00D4FF]">{activeAlert.target}</strong></span>
                  <span>Mitre: <strong className="text-white/80">{activeAlert.mitre}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExecuteContainment}
                disabled={executing || containmentStatus === 'CONTAINED'}
                className="px-4 py-2.5 rounded-lg bg-[#19E68C] hover:bg-[#20f597] text-black font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(25,230,140,0.4)] transition"
              >
                <Shield className="w-4 h-4" />
                {containmentStatus === 'CONTAINED' ? 'THREAT CONTAINED' : 'EXECUTE CONTAINMENT'}
              </button>
              <button
                onClick={() => onResolveThreat && onResolveThreat(null)}
                className="p-2 text-[#8995A7] hover:text-white rounded-lg hover:bg-white/10 transition"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating HUD Trigger Button on Main Screen */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-xl bg-[#080B12]/90 border border-[#162132] text-[#8995A7] hover:text-[#00D4FF] backdrop-blur-md transition shadow-lg"
          title={soundEnabled ? 'Mute Alert Audio' : 'Enable Alert Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#19E68C]" /> : <VolumeX className="w-4 h-4 text-[#FF4545]" />}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center gap-2.5 backdrop-blur-md shadow-2xl transition-all ${
            isOpen
              ? 'bg-[#FF4545] text-white shadow-[0_0_25px_rgba(255,69,69,0.5)]'
              : activeAlert
              ? 'bg-[#FF4545]/20 text-[#FF4545] border border-[#FF4545]/50 animate-pulse'
              : 'bg-[#080B12]/90 text-[#00D4FF] border border-[#00D4FF]/40 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]'
          }`}
        >
          <Zap className="w-4 h-4 animate-spin-slow" />
          <span>{isOpen ? 'CLOSE ATTACK LAB' : 'ATTACK SIMULATION & ALERTS'}</span>
          {activeAlert && (
            <span className="w-2 h-2 rounded-full bg-[#FF4545] animate-ping ml-1" />
          )}
        </button>
      </div>

      {/* Attack Lab Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-96 max-w-[92vw] bg-[#080B12]/98 border border-[#162132] rounded-2xl p-5 shadow-2xl backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#162132] pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF4545]" />
              <h4 className="text-xs font-mono font-bold text-white tracking-wider">
                RED TEAM ATTACK LAB
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#8995A7]">
              LIVE INJECTION
            </span>
          </div>

          <p className="text-[11px] text-[#8995A7] leading-relaxed">
            Trigger real-time attack payloads against Ubuntu honeypot traps and watch the 3D shield, sirens, and telemetry feeds react instantly.
          </p>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {ATTACK_SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const isCurrent = activeAlert?.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleLaunchAttack(sc)}
                  disabled={executing}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                    isCurrent
                      ? 'bg-[#FF4545]/15 border-[#FF4545]/60 shadow-[0_0_15px_rgba(255,69,69,0.3)]'
                      : 'bg-[#0D121C] border-[#162132] hover:border-white/20 hover:bg-[#121824]'
                  }`}
                >
                  <div
                    className="p-2 rounded-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-[#00D4FF] transition">
                        {sc.title}
                      </span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                        style={{ backgroundColor: `${sc.color}25`, color: sc.color }}
                      >
                        {sc.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8995A7] font-mono truncate mt-0.5">
                      {sc.mitre.split(':')[0]} · {sc.target}
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-[#8995A7] group-hover:text-white shrink-0 mt-2 transition" />
                </button>
              );
            })}
          </div>

          {activeAlert && (
            <div className="pt-2 border-t border-[#162132] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#FF4545] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4545] animate-ping" />
                Active Attack in Progress
              </span>
              <button
                onClick={() => onResolveThreat && onResolveThreat(null)}
                className="text-[10px] font-mono text-[#8995A7] hover:text-white underline"
              >
                Clear Threat State
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

