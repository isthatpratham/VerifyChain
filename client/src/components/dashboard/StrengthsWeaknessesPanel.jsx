/**
 * StrengthsWeaknessesPanel.jsx
 * Enterprise strengths and weaknesses analysis card.
 * Redesigned for clean enterprise visual consistency.
 */
import { ThumbsUp, WarningCircle, CheckCircle } from '@phosphor-icons/react';

export function StrengthsWeaknessesPanel({ strengths = [], weaknesses = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[--vc-border]">
          <ThumbsUp size={18} className="text-[--vc-success]" />
          <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">Enterprise Strengths ({strengths.length})</h4>
        </div>
        {strengths.length === 0 ? (
          <p className="text-[--text-xs] text-[--vc-text-tertiary] italic">No specific strength highlights recorded.</p>
        ) : (
          <div className="space-y-2.5">
            {strengths.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-[--radius-sm] bg-[--vc-success-bg] border border-[--color-success-100]">
                <div className="flex items-center gap-1.5 text-[--text-xs] font-bold text-[--vc-success-text]">
                  <CheckCircle size={14} />
                  {item.title}
                </div>
                <p className="text-[11px] text-[--vc-text-secondary] mt-1 leading-normal">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weaknesses */}
      <div className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[--vc-border]">
          <WarningCircle size={18} className="text-[--vc-warning]" />
          <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">Compliance Weaknesses ({weaknesses.length})</h4>
        </div>
        {weaknesses.length === 0 ? (
          <div className="p-3.5 rounded-[--radius-sm] bg-[--vc-success-bg] border border-[--color-success-100]">
            <span className="text-[--text-xs] font-bold text-[--vc-success-text]">No active compliance weaknesses detected.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {weaknesses.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-[--radius-sm] bg-[--vc-warning-bg] border border-[--color-warning-100]">
                <div className="flex items-center gap-1.5 text-[--text-xs] font-bold text-[--vc-warning-text]">
                  <WarningCircle size={14} />
                  {item.title}
                </div>
                <p className="text-[11px] text-[--vc-text-secondary] mt-1 leading-normal">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
