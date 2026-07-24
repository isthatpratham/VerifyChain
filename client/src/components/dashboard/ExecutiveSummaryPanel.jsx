/**
 * ExecutiveSummaryPanel.jsx
 * High-level executive compliance summary component suitable for business decision-makers.
 * Redesigned for clean enterprise visual consistency.
 */
import { ShieldCheck, TrendUp } from '@phosphor-icons/react';

export function ExecutiveSummaryPanel({ summary = {} }) {
  const { overallHealthText = 'EXCELLENT', score = 100, riskLevel = 'LOW', summaryText, topPriorities = [] } = summary;

  return (
    <div className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[--vc-brand]" />
          <h3 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
            Executive Health Summary
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-brand-light]/10 text-[--vc-brand] border border-[--vc-brand]/20">
          HEALTH STATUS: {overallHealthText}
        </span>
      </div>

      <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed] bg-[--vc-bg-base] p-4 rounded-[--radius-sm] border border-[--vc-border]">
        {summaryText || `Enterprise compliance health score stands at ${score}/100 under ${riskLevel} risk level classification.`}
      </p>

      {topPriorities.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[--text-xs] font-bold text-[--vc-text-primary] flex items-center gap-1.5">
            <TrendUp size={14} className="text-[--vc-warning]" />
            Top Action Priorities
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {topPriorities.map((p, idx) => (
              <div key={idx} className="p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] text-[--text-xs] text-[--vc-text-secondary] font-medium truncate">
                {idx + 1}. {p}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
