/**
 * ScoreEngineSection.jsx
 * Highlights the Compliance Health Score (CHS) engine with 3D tilt micro-physics.
 * Grounded in SCORE_ENGINE.md specification.
 */
import { useReveal } from '../../animations/useReveal';
import { useTilt } from '../../animations/useTilt';
import { Container } from '../../layouts/Container';

const WEIGHTS = [
  { authority: 'GST (Goods & Services Tax)', weight: 25, role: 'Tax compliance & active filing status' },
  { authority: 'EPFO (Employees Provident Fund)', weight: 20, role: 'Labour law compliance & monthly returns' },
  { authority: 'ESIC (Employee State Insurance)', weight: 15, role: 'Social security & employee coverage' },
  { authority: 'MCA / ROC (Corporate Registry)', weight: 15, role: 'Legal corporate identity & annual filings' },
  { authority: 'Udyam (MSME Registration)', weight: 15, role: 'Official micro-enterprise registration' },
  { authority: 'FSSAI (Food Safety License)', weight: 10, role: 'Food safety certificate (where applicable)' },
];

export function ScoreEngineSection() {
  const revealRef = useReveal();
  const tiltRef = useTilt({ max: 5, scale: 1.01 });

  return (
    <section
      id="score-engine"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-surface-raised]"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">

          {/* Left Column — Description */}
          <div>
            <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
              Intelligence Specification
            </span>
            <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary] mb-4 tracking-[--ls-snug]">
              Deterministic 0–100 Compliance Scoring Engine
            </h2>
            <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-6">
              Unlike subjective rating tools, VerifyChain computes every Compliance Health Score deterministically based on verified weighted rules across six regulatory authorities.
            </p>

            {/* Threshold Tiers */}
            <div className="flex flex-col gap-3 p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base]">
              <div className="flex items-center justify-between text-[--text-xs] font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[--vc-success]" />
                  <strong className="text-[--vc-text-primary]">75 – 100 : HIGH COMPLIANCE</strong>
                </span>
                <span className="text-[--vc-text-tertiary]">Buyer-Ready Status</span>
              </div>
              <div className="flex items-center justify-between text-[--text-xs] font-medium border-t border-[--vc-border] pt-2">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[--vc-warning]" />
                  <strong className="text-[--vc-text-primary]">40 – 74 : MEDIUM RISK</strong>
                </span>
                <span className="text-[--vc-text-tertiary]">Action Needed</span>
              </div>
              <div className="flex items-center justify-between text-[--text-xs] font-medium border-t border-[--vc-border] pt-2">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[--vc-error]" />
                  <strong className="text-[--vc-text-primary]">0 – 39 : LOW COMPLIANCE</strong>
                </span>
                <span className="text-[--vc-text-tertiary]">High Risk Profile</span>
              </div>
            </div>
          </div>

          {/* Right Column — Weight Allocation Table with 3D Tilt */}
          <div
            ref={tiltRef}
            className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base] transition-shadow duration-[--duration-normal] hover:border-[--vc-border-strong] hover:shadow-[--shadow-sm]"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[--vc-border]">
              <span className="text-[--text-xs] font-semibold text-[--vc-text-secondary] uppercase tracking-[--ls-caps]">
                Authority Weight Allocation
              </span>
              <span className="text-[--text-xs] font-mono font-semibold text-[--vc-brand]">
                Total: 100 Points
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {WEIGHTS.map((w) => (
                <div key={w.authority} className="flex flex-col gap-1 group">
                  <div className="flex items-center justify-between text-[--text-xs]">
                    <span className="font-medium text-[--vc-text-primary] group-hover:text-[--vc-brand] transition-colors">
                      {w.authority}
                    </span>
                    <span className="font-mono font-semibold text-[--vc-text-primary]">{w.weight} pts</span>
                  </div>
                  {/* Weight bar */}
                  <div className="w-full h-1.5 rounded-full bg-[--vc-bg-subtle] overflow-hidden">
                    <div
                      className="h-full bg-[--vc-brand] rounded-full transition-all duration-[--duration-normal] group-hover:bg-[--vc-brand-hover]"
                      style={{ width: `${w.weight * 4}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[--vc-text-tertiary]">{w.role}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
