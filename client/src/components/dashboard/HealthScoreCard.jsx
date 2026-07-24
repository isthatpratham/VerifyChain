/**
 * HealthScoreCard.jsx
 * Enterprise visual score card presenting overall score, risk badge,
 * confidence rating, and scoring engine version.
 */
import { ArrowClockwise, ShieldCheck, Warning, Info, CheckCircle } from '@phosphor-icons/react';

export function HealthScoreCard({ score = 100, riskLevel = 'LOW', confidence = 100, version = 'v1.0.0', lastEvaluated, onRefresh, calculating }) {
  const getRiskColor = () => {
    if (riskLevel === 'HIGH') return 'text-[--vc-error] bg-[--vc-error-bg] border-[--vc-error]';
    if (riskLevel === 'MEDIUM') return 'text-[--vc-warning] bg-[--vc-warning-bg] border-[--vc-warning]';
    return 'text-[--vc-success] bg-[--vc-success-bg] border-[--vc-success]';
  };

  const getScoreColor = () => {
    if (score < 60) return 'text-[--vc-error]';
    if (score < 85) return 'text-[--vc-warning]';
    return 'text-[--vc-success]';
  };

  return (
    <div className="relative overflow-hidden rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[--vc-border]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-[--vc-brand]" />
            <h3 className="font-[--font-heading] text-[--text-lg] font-bold text-[--vc-text-primary]">
              Compliance Health Rating
            </h3>
          </div>
          <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1">
            Deterministic statutory compliance evaluation engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[--radius-sm] text-[--text-xs] font-semibold border ${getRiskColor()}`}>
            {riskLevel === 'HIGH' && <Warning size={14} />}
            {riskLevel === 'LOW' && <CheckCircle size={14} />}
            {riskLevel} RISK LEVEL
          </span>
          <button
            onClick={onRefresh}
            disabled={calculating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[--radius-sm] bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] text-[--text-xs] font-semibold text-[--vc-text-primary] transition-colors border border-[--vc-border] disabled:opacity-50"
          >
            <ArrowClockwise size={14} className={calculating ? 'animate-spin' : ''} />
            {calculating ? 'Recalculating...' : 'Recalculate Score'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
        {/* Primary Score Display */}
        <div className="flex flex-col items-center justify-center p-5 bg-[--vc-bg-base] rounded-[--radius-md] border border-[--vc-border]">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-[--vc-surface-raised] border-4 border-[--vc-border] shadow-inner">
            <span className={`text-4xl font-extrabold font-mono ${getScoreColor()}`}>
              {score}
            </span>
            <span className="absolute bottom-2 text-[10px] text-[--vc-text-tertiary] font-mono">/ 100</span>
          </div>
          <span className="text-[--text-xs] font-bold text-[--vc-text-primary] mt-3">Overall Health Score</span>
        </div>

        {/* Evaluation Metrics */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[--vc-brand]" />
              <span className="text-[--text-xs] font-medium text-[--vc-text-secondary]">Data Completeness Confidence</span>
            </div>
            <span className="text-[--text-xs] font-bold font-mono text-[--vc-text-primary]">{confidence}%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
            <span className="text-[--text-xs] font-medium text-[--vc-text-secondary]">Scoring Engine Version</span>
            <span className="text-[11px] font-mono font-bold text-[--vc-brand] bg-[--vc-brand-light]/10 px-2 py-0.5 rounded-[--radius-sm] border border-[--vc-brand]/20">
              {version}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
            <span className="text-[--text-xs] font-medium text-[--vc-text-secondary]">Last Evaluated Timestamp</span>
            <span className="text-[--text-xs] font-mono text-[--vc-text-tertiary]">
              {lastEvaluated ? new Date(lastEvaluated).toLocaleString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
