/**
 * ScoreRingDisplay.jsx
 * Compliance Health Score (CHS 0-100) SVG progress ring and authority breakdown.
 * Grounded in SCORE_ENGINE.md and UI_UX.md.
 */

const AUTHORITIES_DEFAULT = [
  { name: 'GST', weight: 25, score: 25, status: 'COMPLIANT' },
  { name: 'EPFO', weight: 20, score: 20, status: 'COMPLIANT' },
  { name: 'ESIC', weight: 15, score: 15, status: 'COMPLIANT' },
  { name: 'MCA / ROC', weight: 15, score: 15, status: 'COMPLIANT' },
  { name: 'Udyam', weight: 15, score: 15, status: 'COMPLIANT' },
  { name: 'FSSAI', weight: 10, score: 10, status: 'EXEMPT' },
];

/**
 * @param {Object} props
 * @param {number} [props.score=88]
 * @param {'HIGH'|'MEDIUM'|'LOW'} [props.level='HIGH']
 * @param {Array} [props.breakdown]
 */
export function ScoreRingDisplay({
  score = 88,
  level = 'HIGH',
  breakdown = AUTHORITIES_DEFAULT,
}) {
  const radius = 42;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getLevelConfig = (lvl) => {
    if (lvl === 'LOW' || score < 40) {
      return { label: 'LOW RISK', color: 'var(--vc-error)', bg: 'var(--vc-error-bg)', text: 'var(--vc-error-text)' };
    }
    if (lvl === 'MEDIUM' || score < 75) {
      return { label: 'MEDIUM RISK', color: 'var(--vc-warning)', bg: 'var(--vc-warning-bg)', text: 'var(--vc-warning-text)' };
    }
    return { label: 'HIGH COMPLIANCE', color: 'var(--vc-success)', bg: 'var(--vc-success-bg)', text: 'var(--vc-success-text)' };
  };

  const config = getLevelConfig(level);

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
                {score}
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

        {/* Authority Breakdown Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[--vc-border]">
            <h3 className="font-[--font-heading] text-[--text-sm] font-semibold text-[--vc-text-primary]">
              Authority Compliance Weight Breakdown
            </h3>
            <span className="text-[11px] font-mono text-[--vc-text-tertiary]">
              6 Regulators Evaluated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {breakdown.map((item) => (
              <div
                key={item.name}
                className="p-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-[--vc-text-primary]">{item.name}</span>
                  <span className="font-mono text-[--vc-text-tertiary]">{item.weight}pts</span>
                </div>
                <span className="text-[10px] font-bold text-[--vc-success]">
                  {item.status || 'COMPLIANT'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
