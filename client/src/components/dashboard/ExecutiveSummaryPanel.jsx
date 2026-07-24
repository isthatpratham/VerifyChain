/**
 * ExecutiveSummaryPanel.jsx
 * High-level executive compliance summary component suitable for business decision-makers.
 */
import { ShieldCheck, TrendUp } from '@phosphor-icons/react';

export function ExecutiveSummaryPanel({ summary = {} }) {
  const { overallHealthText = 'EXCELLENT', score = 100, riskLevel = 'LOW', summaryText, topPriorities = [] } = summary;

  return (
    <div className="rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-100">Executive Health Summary</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            HEALTH STATUS: {overallHealthText}
          </span>
        </div>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-3.5 rounded-lg border border-neutral-800/40">
        {summaryText || `Enterprise compliance health score stands at ${score}/100 under ${riskLevel} risk level classification.`}
      </p>

      {topPriorities.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
            <TrendUp size={14} className="text-amber-400" />
            Top Action Priorities
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {topPriorities.map((p, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60 text-xs text-neutral-200 font-medium line-clamp-1">
                {idx + 1}. {p}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
