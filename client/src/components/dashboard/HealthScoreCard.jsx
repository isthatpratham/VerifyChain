/**
 * HealthScoreCard.jsx
 * Prominent visual score card presenting overall score, risk badge,
 * confidence rating, and configuration version.
 */
import { ArrowClockwise, ShieldCheck, Warning, Info, CheckCircle } from '@phosphor-icons/react';

export function HealthScoreCard({ score = 100, riskLevel = 'LOW', confidence = 100, version = 'v1.0.0', lastEvaluated, onRefresh, calculating }) {
  const getRiskColor = () => {
    if (riskLevel === 'HIGH') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (riskLevel === 'MEDIUM') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const getScoreColor = () => {
    if (score < 60) return 'from-red-500 to-amber-500 text-red-400';
    if (score < 85) return 'from-amber-400 to-yellow-500 text-amber-400';
    return 'from-emerald-400 to-teal-500 text-emerald-400';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-neutral-100">Compliance Health Rating</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Deterministic statutory compliance evaluation engine</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor()}`}>
            {riskLevel === 'HIGH' && <Warning size={14} />}
            {riskLevel === 'LOW' && <CheckCircle size={14} />}
            {riskLevel} RISK LEVEL
          </span>
          <button
            onClick={onRefresh}
            disabled={calculating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors border border-neutral-700 disabled:opacity-50"
          >
            <ArrowClockwise size={14} className={calculating ? 'animate-spin' : ''} />
            {calculating ? 'Recalculating...' : 'Recalculate Score'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
        {/* Primary Score Ring */}
        <div className="flex flex-col items-center justify-center p-4 bg-neutral-950/50 rounded-xl border border-neutral-800/50">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-neutral-900 border-4 border-neutral-800 shadow-inner">
            <span className={`text-4xl font-extrabold bg-gradient-to-br ${getScoreColor()} bg-clip-text text-transparent`}>
              {score}
            </span>
            <span className="absolute bottom-3 text-[10px] text-neutral-500 font-mono">/ 100</span>
          </div>
          <span className="text-xs font-medium text-neutral-300 mt-3">Overall Health Score</span>
        </div>

        {/* Evaluation Metrics */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-400" />
              <span className="text-xs font-medium text-neutral-300">Data Completeness Confidence</span>
            </div>
            <span className="text-xs font-bold font-mono text-neutral-100">{confidence}%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40">
            <span className="text-xs font-medium text-neutral-400">Scoring Engine Version</span>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {version}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40">
            <span className="text-xs font-medium text-neutral-400">Last Evaluated Timestamp</span>
            <span className="text-xs font-mono text-neutral-300">
              {lastEvaluated ? new Date(lastEvaluated).toLocaleString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
