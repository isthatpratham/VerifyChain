/**
 * ScoreSnapshotList.jsx
 * Historical score evaluation snapshot log list.
 */
import { ClockCounterClockwise, CalendarBlank } from '@phosphor-icons/react';

export function ScoreSnapshotList({ snapshots = [] }) {
  return (
    <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={20} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-100">Score Snapshot History</h3>
        </div>
        <span className="text-xs text-neutral-400">{snapshots.length} historical logs</span>
      </div>

      {snapshots.length === 0 ? (
        <div className="p-4 text-center text-xs text-neutral-500 italic">No historical score snapshots recorded yet.</div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {snapshots.map((snap) => (
            <div key={snap.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40 text-xs">
              <div className="flex items-center gap-3">
                <CalendarBlank size={16} className="text-neutral-500" />
                <div>
                  <span className="text-neutral-200 font-mono">{new Date(snap.evaluated_at).toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-500 ml-2 font-mono">v{snap.config_version}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs font-bold text-neutral-100">{snap.overall_score} / 100</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${snap.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
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
