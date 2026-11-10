import React, { useState, useEffect } from 'react';
import { defenceService } from '../../services/defenceService';
import { Shield, AlertTriangle, CheckCircle2, RotateCcw, Ban, Activity, RefreshCw } from 'lucide-react';

export default function DefenceCenter() {
  const [status, setStatus] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [newTarget, setNewTarget] = useState('192.168.1.105');
  const [newActionType, setNewActionType] = useState('BLOCK_IP');
  const [newIncidentId, setNewIncidentId] = useState('inc-lab-001');

  const fetchDefenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusData, actionsData] = await Promise.all([
        defenceService.getStatus(),
        defenceService.listActions(),
      ]);
      setStatus(statusData);
      setActions(actionsData);
    } catch (err) {
      setError(err.message || 'Failed to load defence status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefenceData();
  }, []);

  const handlePropose = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await defenceService.proposeAction({
        incident_id: newIncidentId,
        action_type: newActionType,
        target: newTarget,
        risk_score: 75.0,
        confidence: 0.9,
        impact: 'MEDIUM',
        reversibility: true,
        approval_required: true,
      });
      await fetchDefenceData();
    } catch (err) {
      alert(`Proposal rejected: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (actionId) => {
    if (!window.confirm('Confirm execution of this containment action?')) return;
    try {
      await defenceService.approveAction(actionId);
      await fetchDefenceData();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (actionId) => {
    try {
      await defenceService.rejectAction(actionId, 'Operator manual rejection');
      await fetchDefenceData();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleRollback = async (actionId) => {
    if (!window.confirm('Rollback and restore firewall to previous state?')) return;
    try {
      await defenceService.rollbackAction(actionId);
      await fetchDefenceData();
    } catch (err) {
      alert(`Rollback error: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#080B12] text-[#F4F7FB] min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#0D1622] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#00D4FF] flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#00D4FF]" />
              INTELLIGENT DEFENCE CENTER
            </h1>
            <p className="text-xs text-[#8995A7]">Operator-controlled containment & reversible automated response</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded bg-[#0D1622] border border-[#00D4FF]/30 text-[#00D4FF]">
              MODE: {status?.mode || 'OBSERVE'}
            </span>
            <button
              onClick={fetchDefenceData}
              className="p-2 rounded bg-[#0D1622] hover:bg-[#131B2A] text-[#8995A7] transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#FF4545]/10 border border-[#FF4545]/30 rounded text-[#FF4545] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Defence Mode</span>
            <div className="text-xl font-bold text-[#F4F7FB] mt-1">{status?.mode || 'LOADING'}</div>
            <span className="text-[10px] text-[#19E68C]">Safety policy active</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Pending Approvals</span>
            <div className="text-xl font-bold text-[#FFB547] mt-1">{status?.pending_approvals_count ?? 0}</div>
            <span className="text-[10px] text-[#8995A7]">Human-in-the-loop gate</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Enforced Actions</span>
            <div className="text-xl font-bold text-[#00D4FF] mt-1">{status?.executed_actions_count ?? 0}</div>
            <span className="text-[10px] text-[#19E68C]">Containment verified</span>
          </div>
          <div className="bg-[#0D121C] p-4 rounded border border-[#162132]">
            <span className="text-xs text-[#8995A7]">Emergency Status</span>
            <div className={`text-xl font-bold mt-1 ${status?.emergency_disabled ? 'text-[#FF4545]' : 'text-[#19E68C]'}`}>
              {status?.emergency_disabled ? 'HALTED' : 'NORMAL'}
            </div>
            <span className="text-[10px] text-[#8995A7]">Lab boundaries guarded</span>
          </div>
        </div>

        {/* Propose Action Form */}
        <div className="bg-[#0D121C] p-5 rounded border border-[#162132]">
          <h2 className="text-sm font-semibold text-[#F4F7FB] mb-3 flex items-center gap-2">
            <Ban className="w-4 h-4 text-[#FFB547]" />
            Propose Containment Action
          </h2>
          <form onSubmit={handlePropose} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Incident ID (e.g. inc-001)"
              value={newIncidentId}
              onChange={(e) => setNewIncidentId(e.target.value)}
              className="bg-[#05080E] border border-[#162132] px-3 py-2 text-xs rounded text-[#F4F7FB] focus:outline-none focus:border-[#00D4FF]"
              required
            />
            <input
              type="text"
              placeholder="Target IP / Host"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="bg-[#05080E] border border-[#162132] px-3 py-2 text-xs rounded text-[#F4F7FB] focus:outline-none focus:border-[#00D4FF]"
              required
            />
            <select
              value={newActionType}
              onChange={(e) => setNewActionType(e.target.value)}
              className="bg-[#05080E] border border-[#162132] px-3 py-2 text-xs rounded text-[#F4F7FB] focus:outline-none focus:border-[#00D4FF]"
            >
              <option value="BLOCK_IP">BLOCK_IP (Temporary)</option>
              <option value="RATE_LIMIT">RATE_LIMIT</option>
              <option value="QUARANTINE_ENDPOINT">QUARANTINE_ENDPOINT</option>
              <option value="DENYLIST">DENYLIST</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#00D4FF] hover:bg-[#00B4D8] text-[#080B12] text-xs font-bold py-2 px-4 rounded transition"
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>

        {/* Actions Table */}
        <div className="bg-[#0D121C] rounded border border-[#162132] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#162132]">
            <h2 className="text-sm font-semibold text-[#F4F7FB]">Action Lifecycle & Enforcement Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080B12] text-[#8995A7] border-b border-[#162132]">
                <tr>
                  <th className="py-3 px-4">Action ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162132]">
                {actions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-[#8995A7]">
                      No defence actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  actions.map((act) => (
                    <tr key={act.id} className="hover:bg-[#111724] transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#00D4FF]">{act.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 font-semibold">{act.action_type}</td>
                      <td className="py-3 px-4 font-mono">{act.target}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.status === 'EXECUTED'
                              ? 'bg-[#19E68C]/10 text-[#19E68C] border border-[#19E68C]/30'
                              : act.status === 'PROPOSED'
                              ? 'bg-[#FFB547]/10 text-[#FFB547] border border-[#FFB547]/30'
                              : act.status === 'ROLLED_BACK'
                              ? 'bg-[#8995A7]/10 text-[#8995A7]'
                              : 'bg-[#FF4545]/10 text-[#FF4545]'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{act.risk_score}</td>
                      <td className="py-3 px-4 text-[#8995A7]">
                        {new Date(act.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {act.status === 'PROPOSED' && (
                          <>
                            <button
                              onClick={() => handleApprove(act.id)}
                              className="px-2 py-1 bg-[#19E68C] hover:bg-[#15C276] text-[#080B12] rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(act.id)}
                              className="px-2 py-1 bg-[#162132] hover:bg-[#202C40] text-[#FF4545] rounded text-[10px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {act.status === 'EXECUTED' && act.reversibility && (
                          <button
                            onClick={() => handleRollback(act.id)}
                            className="px-2 py-1 bg-[#FFB547]/10 border border-[#FFB547]/30 hover:bg-[#FFB547]/20 text-[#FFB547] rounded text-[10px] inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Rollback
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
