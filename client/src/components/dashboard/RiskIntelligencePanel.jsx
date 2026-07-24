/**
 * RiskIntelligencePanel.jsx
 * Deterministic risk intelligence overview panel displaying risk levels,
 * severity ratings, affected statutory areas, and business impacts.
 */
import { WarningOctagon, Warning, CheckCircle, ShieldWarning } from '@phosphor-icons/react';

export function RiskIntelligencePanel({ riskAnalysis = {} }) {
  const {
    overallRiskLevel = 'LOW',
    severity = 'LOW',
    recommendedAttentionLevel = 'SAFE_MAINTENANCE',
    affectedAuthorities = [],
    potentialImpacts = [],
  } = riskAnalysis;

  const isHighRisk = overallRiskLevel === 'HIGH';
  const isMedRisk = overallRiskLevel === 'MEDIUM';

  return (
    <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldWarning size={20} className={isHighRisk ? 'text-red-400' : isMedRisk ? 'text-amber-400' : 'text-emerald-400'} />
          <h3 className="text-sm font-semibold text-neutral-100">Statutory Risk Intelligence</h3>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
          {recommendedAttentionLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
          <span className="text-neutral-400 text-[11px]">Overall Risk Level</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold">
            {isHighRisk ? (
              <WarningOctagon size={16} className="text-red-400" />
            ) : isMedRisk ? (
              <Warning size={16} className="text-amber-400" />
            ) : (
              <CheckCircle size={16} className="text-emerald-400" />
            )}
            <span className={isHighRisk ? 'text-red-400' : isMedRisk ? 'text-amber-400' : 'text-emerald-400'}>
              {overallRiskLevel}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
          <span className="text-neutral-400 text-[11px]">Risk Severity</span>
          <div className="mt-1 font-bold text-neutral-200 uppercase font-mono">{severity}</div>
        </div>
      </div>

      {affectedAuthorities.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
          <span className="text-xs font-medium text-neutral-400">Affected Authorities</span>
          <div className="flex flex-wrap gap-1.5">
            {affectedAuthorities.map((auth) => (
              <span key={auth} className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                {auth}
              </span>
            ))}
          </div>
        </div>
      )}

      {potentialImpacts.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
          <span className="text-xs font-medium text-neutral-400">Potential Business Impact</span>
          <ul className="space-y-1 text-xs text-neutral-300">
            {potentialImpacts.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span className="text-[11px] leading-tight text-neutral-300">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
