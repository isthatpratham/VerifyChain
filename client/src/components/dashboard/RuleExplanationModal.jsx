/**
 * RuleExplanationModal.jsx
 * Human-readable Rules Engine Explanation Modal for Compliance Workspace.
 */
import { ShieldCheck, Scales, Info } from '@phosphor-icons/react';

import { Modal } from '../../ui/Modal';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {string} [props.authority]
 * @param {Array} [props.explanations]
 */
export function RuleExplanationModal({ open, onClose, authority, explanations = [] }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={authority ? `${authority} Statutory Compliance Explanation` : 'Compliance Decision Reasoning'}
      size="lg"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <ShieldCheck size={20} className="text-[--vc-brand]" />
          <p className="text-[--text-xs] text-[--vc-text-secondary]">
            Evaluated by VerifyChain Deterministic Rules Engine (v1.0.0). All rules are grounded in Indian statutory regulations.
          </p>
        </div>

        {explanations.length === 0 ? (
          <div className="p-6 text-center text-[--text-xs] text-[--vc-text-tertiary] border border-[--vc-border] rounded-[--radius-sm]">
            No detailed rule explanation logs available for this authority.
          </div>
        ) : (
          explanations.map((exp, idx) => (
            <div
              key={idx}
              className="p-5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-semibold text-[--vc-brand] uppercase tracking-wider block">
                    {exp.ruleId || 'STATUTORY_RULE'}
                  </span>
                  <h4 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary] mt-0.5">
                    {exp.ruleName || `${authority} Regulatory Filing Requirement`}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] ${
                    exp.isApplicable
                      ? 'bg-[--vc-success-bg] text-[--vc-success-text]'
                      : 'bg-[--vc-bg-subtle] text-[--vc-text-tertiary]'
                  }`}
                >
                  {exp.isApplicable ? 'MANDATORY RULE' : 'EXEMPT RULE'}
                </span>
              </div>

              {/* Human-Readable Explanation */}
              <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-start gap-2.5">
                <Info size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                <p className="text-[--text-xs] text-[--vc-text-primary] leading-[--lh-relaxed] font-medium">
                  {exp.explanation}
                </p>
              </div>

              {/* Legal Reference */}
              {exp.legalReference && (
                <div className="flex items-center gap-1.5 text-[11px] text-[--vc-text-tertiary]">
                  <Scales size={14} className="text-[--vc-brand]" />
                  <span>Statutory Reference: {exp.legalReference}</span>
                </div>
              )}

              {/* Evaluated Conditions */}
              {exp.matchedConditions && exp.matchedConditions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[--vc-border]">
                  <span className="text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider block mb-1.5">
                    Evaluated Business Conditions:
                  </span>
                  <div className="flex flex-col gap-1">
                    {exp.matchedConditions.map((cond, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-[11px] font-mono text-[--vc-text-secondary]">
                        <span>{cond.field} {cond.operator} {String(cond.expected)}</span>
                        <span className={cond.matched ? 'text-[--vc-success] font-semibold' : 'text-[--vc-error]'}>
                          {cond.matched ? 'MATCHED' : 'UNMATCHED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
