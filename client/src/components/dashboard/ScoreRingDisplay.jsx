/**
 * ScoreRingDisplay.jsx
 * Compliance Health Score (CHS 0-100) SVG progress ring and authority breakdown.
 * Grounded in SCORE_ENGINE.md and UI_UX.md.
 *
 * All data sourced from the live backend via props.
 * No mock or hardcoded fallback values.
 */
import { memo } from 'react';
import { Skeleton } from '../../ui/Skeleton';

/**
 * @param {Object} props
 * @param {number|null} props.score      Overall health score (0–100)
 * @param {string|null} props.level      Risk classification: 'HIGH' | 'MEDIUM' | 'LOW'
 * @param {Array}       props.breakdown  Per-authority breakdown from the score engine
 * @param {boolean}     props.loading    True while backend data is being fetched
 */
export const ScoreRingDisplay = memo(function ScoreRingDisplay({
  score = null,
  level = null,
  breakdown = [],
  loading = false,
}) {
  const radius = 42;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safeScore = typeof score === 'number' ? score : 0;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getLevelConfig = (lvl, s) => {
    const effectiveLevel = lvl || (s !== null && s < 40 ? 'LOW' : s !== null && s < 75 ? 'MEDIUM' : 'HIGH');
    if (effectiveLevel === 'LOW') {
      return { label: 'LOW COMPLIANCE', color: 'var(--vc-error)', bg: 'var(--vc-error-bg)', text: 'var(--vc-error-text)' };
    }
    if (effectiveLevel === 'MEDIUM') {
      return { label: 'MEDIUM COMPLIANCE', color: 'var(--vc-warning)', bg: 'var(--vc-warning-bg)', text: 'var(--vc-warning-text)' };
    }
    return { label: 'HIGH COMPLIANCE', color: 'var(--vc-success)', bg: 'var(--vc-success-bg)', text: 'var(--vc-success-text)' };
  };

  const config = getLevelConfig(level, score);

  if (loading) {
    return (
      <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-center">
          <Skeleton className="h-48 w-full rounded-[--radius-sm]" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-16 w-full rounded-[--radius-sm]" />
            <Skeleton className="h-16 w-full rounded-[--radius-sm]" />
            <Skeleton className="h-16 w-full rounded-[--radius-sm]" />
          </div>
        </div>
      </div>
    );
  }

  if (score === null) {
    return (
      <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8 flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[--vc-border] flex items-center justify-center mb-4">
          <span className="text-[--vc-text-tertiary] text-2xl font-bold">—</span>
        </div>
        <p className="font-semibold text-[--vc-text-primary] text-sm">Compliance Score Not Yet Calculated</p>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 max-w-xs">
          Complete your business profile to trigger the scoring engine and see your live compliance health rating.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-center">

        {/* Score Ring Visual */}
        <div className="flex flex-col items-center justify-center p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg height="128" width="128" className="-rotate-90 transform">
              {/* Background ring */}
              <circle
                stroke="var(--vc-bg-subtle)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="64"
                cy="64"
              />
              {/* Progress ring */}
              <circle
                stroke={config.color}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="64"
                cy="64"
              />
            </svg>

            {/* Score Center Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-[--font-heading] text-[--text-3xl] font-bold text-[--vc-text-primary] leading-none">
                {safeScore}
              </span>
              <span className="text-[10px] text-[--vc-text-tertiary] uppercase tracking-wider mt-1">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span
              className="px-2.5 py-1 rounded-[--radius-sm] text-[11px] font-bold tracking-wider uppercase"
              style={{ backgroundColor: config.bg, color: config.text }}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Authority Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[--vc-border]">
            <h3 className="font-[--font-heading] text-[--text-sm] font-semibold text-[--vc-text-primary]">
              Authority Compliance Weight Breakdown
            </h3>
            <span className="text-[11px] font-mono text-[--vc-text-tertiary]">
              {breakdown.length} {breakdown.length === 1 ? 'Regulator' : 'Regulators'} Evaluated
            </span>
          </div>

          {breakdown.length === 0 ? (
            <div className="py-6 text-center text-[--text-xs] text-[--vc-text-tertiary]">
              No authority breakdown available yet. Run a compliance evaluation to populate this section.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {breakdown.map((item) => {
                const statusColor =
                  item.status === 'COMPLIANT' ? 'var(--vc-success)' :
                  item.status === 'OVERDUE' ? 'var(--vc-error)' :
                  item.status === 'DUE' ? 'var(--vc-warning)' :
                  'var(--vc-text-tertiary)';
                return (
                  <div
                    key={item.name || item.authority}
                    className="p-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-[--vc-text-primary]">{item.name || item.authority}</span>
                      {item.weight != null && (
                        <span className="font-mono text-[--vc-text-tertiary]">{item.weight}pts</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: statusColor }}>
                      {item.status || 'UNKNOWN'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

