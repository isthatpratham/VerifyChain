/**
 * RecommendationsList.jsx
 * Deterministic prioritized action recommendations component with estimated score impact badges.
 * Redesigned for unified enterprise light surface design language.
 */
import { Target, ArrowUpRight } from '@phosphor-icons/react';

export function RecommendationsList({ recommendations = [] }) {
  const getPriorityBadge = (priority) => {
    if (priority === 'CRITICAL') return 'bg-[--vc-error-bg] text-[--vc-error-text] border-[--color-error-100]';
    if (priority === 'HIGH') return 'bg-[--vc-warning-bg] text-[--vc-warning-text] border-[--color-warning-100]';
    return 'bg-[--vc-brand-light]/10 text-[--vc-brand] border-[--vc-brand]/20';
  };

  return (
    <div className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-[--vc-brand]" />
          <h3 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
            Prioritized Action Recommendations
          </h3>
        </div>
        <span className="text-[--text-xs] font-mono text-[--vc-text-tertiary]">{recommendations.length} action items</span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-6 text-center rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
          <p className="text-[--text-xs] text-[--vc-text-secondary]">All statutory compliance requirements are currently up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] hover:border-[--vc-border-strong] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[--radius-sm] border ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <h4 className="text-[--text-xs] font-bold text-[--vc-text-primary]">{rec.title}</h4>
                  </div>
                  <p className="text-[11px] text-[--vc-text-secondary] leading-normal mt-1">{rec.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[--text-xs] font-bold text-[--vc-success] bg-[--vc-success-bg] px-2.5 py-1 rounded-[--radius-sm] border border-[--color-success-100] font-mono">
                  <ArrowUpRight size={14} />
                  {rec.estimatedScoreImpact}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[--vc-border] flex items-center justify-between text-[11px] text-[--vc-text-tertiary]">
                <span>Reason: {rec.reason}</span>
                <span className="font-mono text-[--vc-text-secondary] font-semibold">{rec.authority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
