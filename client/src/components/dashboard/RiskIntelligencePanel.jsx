/**
 * RiskIntelligencePanel.jsx
 * Deterministic risk intelligence overview panel displaying risk levels,
 * severity ratings, affected statutory areas, and business impacts.
 * Redesigned for unified enterprise light surface design language.
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
    <div className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldWarning size={20} className={isHighRisk ? 'text-[--vc-error]' : isMedRisk ? 'text-[--vc-warning]' : 'text-[--vc-success]'} />
          <h3 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
            Statutory Risk Intelligence
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-bg-base] text-[--vc-text-secondary] border border-[--vc-border]">
          {recommendedAttentionLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
          <span className="text-[--vc-text-tertiary] text-[11px] font-medium">Overall Risk Level</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold">
            {isHighRisk ? (
              <WarningOctagon size={16} className="text-[--vc-error]" />
            ) : isMedRisk ? (
              <Warning size={16} className="text-[--vc-warning]" />
            ) : (
              <CheckCircle size={16} className="text-[--vc-success]" />
            )}
            <span className={isHighRisk ? 'text-[--vc-error]' : isMedRisk ? 'text-[--vc-warning]' : 'text-[--vc-success]'}>
              {overallRiskLevel}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border]">
          <span className="text-[--vc-text-tertiary] text-[11px] font-medium">Risk Severity</span>
          <div className="mt-1 font-bold text-[--vc-text-primary] uppercase font-mono">{severity}</div>
        </div>
      </div>

      {affectedAuthorities.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[--vc-border]">
          <span className="text-[--text-xs] font-bold text-[--vc-text-primary]">Affected Authorities</span>
          <div className="flex flex-wrap gap-1.5">
            {affectedAuthorities.map((auth) => (
              <span key={auth} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-error-bg] text-[--vc-error-text] border border-[--color-error-100]">
                {auth}
              </span>
            ))}
          </div>
        </div>
      )}

      {potentialImpacts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[--vc-border]">
          <span className="text-[--text-xs] font-bold text-[--vc-text-primary]">Potential Business Impact</span>
          <ul className="space-y-1.5 text-xs">
            {potentialImpacts.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[--vc-text-secondary]">
                <span className="text-[--vc-warning] font-bold">•</span>
                <span className="text-[11px] leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
