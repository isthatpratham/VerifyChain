/**
 * ScoreSnapshotList.jsx
 * Historical score evaluation snapshot log list.
 * Redesigned for unified enterprise light surface design language.
 */
import { ClockCounterClockwise, CalendarBlank } from '@phosphor-icons/react';

export function ScoreSnapshotList({ snapshots = [] }) {
  return (
    <div className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={20} className="text-[--vc-brand]" />
          <h3 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
            Score Snapshot History
          </h3>
        </div>
        <span className="text-[--text-xs] font-mono text-[--vc-text-tertiary]">{snapshots.length} historical logs</span>
      </div>

      {snapshots.length === 0 ? (
        <div className="p-6 text-center rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
          <p className="text-[--text-xs] text-[--vc-text-secondary]">No historical score snapshots recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {snapshots.map((snap) => (
            <div key={snap.id} className="flex items-center justify-between p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] text-xs">
              <div className="flex items-center gap-3">
                <CalendarBlank size={16} className="text-[--vc-text-tertiary]" />
                <div>
                  <span className="text-[--vc-text-primary] font-mono font-medium">{new Date(snap.evaluated_at).toLocaleString()}</span>
                  <span className="text-[10px] text-[--vc-text-tertiary] ml-2 font-mono">v{snap.config_version}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs font-bold text-[--vc-text-primary]">{snap.overall_score} / 100</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[--radius-sm] ${snap.risk_level === 'HIGH' ? 'bg-[--vc-error-bg] text-[--vc-error-text]' : 'bg-[--vc-success-bg] text-[--vc-success-text]'}`}>
                  {snap.risk_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
