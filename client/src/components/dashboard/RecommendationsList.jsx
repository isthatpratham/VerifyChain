/**
 * RecommendationsList.jsx
 * Deterministic prioritized action recommendations component with estimated score impact badges.
 */
import { Target, ArrowUpRight } from '@phosphor-icons/react';

export function RecommendationsList({ recommendations = [] }) {
  const getPriorityBadge = (priority) => {
    if (priority === 'CRITICAL') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (priority === 'HIGH') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  return (
    <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-100">Prioritized Action Recommendations</h3>
        </div>
        <span className="text-xs text-neutral-400">{recommendations.length} action items</span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-6 text-center rounded-lg bg-neutral-950/40 border border-neutral-800/40">
          <p className="text-xs text-neutral-400">All statutory compliance requirements are currently up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/60 hover:border-neutral-700/80 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-200">{rec.title}</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal mt-1">{rec.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                  <ArrowUpRight size={14} />
                  {rec.estimatedScoreImpact}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Reason: {rec.reason}</span>
                <span className="font-mono text-neutral-400">{rec.authority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
