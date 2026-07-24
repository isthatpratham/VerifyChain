/**
 * StrengthsWeaknessesPanel.jsx
 * Enterprise strengths and weaknesses analysis card.
 */
import { ThumbsUp, WarningCircle, CheckCircle } from '@phosphor-icons/react';

export function StrengthsWeaknessesPanel({ strengths = [], weaknesses = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <ThumbsUp size={16} className="text-emerald-400" />
          <h4 className="text-sm font-semibold text-neutral-100">Enterprise Strengths ({strengths.length})</h4>
        </div>
        {strengths.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">No specific strength highlights recorded.</p>
        ) : (
          <div className="space-y-2">
            {strengths.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle size={14} />
                  {item.title}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-normal">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weaknesses */}
      <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <WarningCircle size={16} className="text-amber-400" />
          <h4 className="text-sm font-semibold text-neutral-100">Compliance Weaknesses ({weaknesses.length})</h4>
        </div>
        {weaknesses.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <span className="text-xs font-medium text-emerald-400">No active compliance weaknesses detected.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {weaknesses.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <WarningCircle size={14} />
                  {item.title}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-normal">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
