/**
 * ComplianceIntelligenceModal.jsx
 * Modular Compliance Intelligence Workspace for individual statutory obligations.
 * Features Summary, Applicability, Legal, Documents, Renewal, Metadata, and Extension Placeholders.
 */
import {
  ShieldCheck,
  Scales,
  FileText,
  Calendar,
  Building,
  Info,
  Clock,
  CheckCircle,
  WarningCircle,
  Prohibit,
  Vault,
  BellSimple,
  ChartLine,
} from '@phosphor-icons/react';
import { Modal } from '../../ui/Modal';

/**
 * Get statutory legal reference metadata by authority
 */
function getLegalMetadata(authority) {
  switch (authority) {
    case 'GST':
      return {
        act: 'Central Goods and Services Tax Act, 2017',
        section: 'Section 39 (Monthly/Quarterly Returns & Tax Settlement)',
        jurisdiction: 'Central Board of Indirect Taxes and Customs (CBIC) & State GST Department',
        reqDoc: 'GST Registration Certificate (Form GST REG-06) & GSTR 3B Receipts',
      };
    case 'EPFO':
      return {
        act: 'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
        section: 'Section 6 & Scheme Paragraph 38',
        jurisdiction: 'Employees Provident Fund Organisation, Ministry of Labour & Employment',
        reqDoc: 'EPFO Registration Allotment Letter & Monthly ECR Payment Challan',
      };
    case 'ESIC':
      return {
        act: 'Employees State Insurance Act, 1948',
        section: 'Section 1(5) & Section 40',
        jurisdiction: 'Employees State Insurance Corporation, Ministry of Labour',
        reqDoc: 'ESIC Code Registration Letter & Monthly Contribution Statements',
      };
    case 'MCA':
      return {
        act: 'Companies Act, 2013',
        section: 'Section 137 (Filing of Financial Statements in AOC-4 / MGT-7)',
        jurisdiction: 'Ministry of Corporate Affairs & Registrar of Companies (ROC)',
        reqDoc: 'Certificate of Incorporation, Audited Financial Statements, ROC AOC-4 Acknowledgements',
      };
    case 'UDYAM':
      return {
        act: 'Micro, Small and Medium Enterprises Development Act, 2006',
        section: 'Section 7 (Classification of MSMEs)',
        jurisdiction: 'Ministry of Micro, Small and Medium Enterprises',
        reqDoc: 'Udyam Registration Certificate & Self-Declaration Artifacts',
      };
    case 'FSSAI':
      return {
        act: 'Food Safety and Standards Act, 2006',
        section: 'Section 31 (Licensing and Registration of Food Businesses)',
        jurisdiction: 'Food Safety and Standards Authority of India (FSSAI)',
        reqDoc: 'FSSAI License / Registration Certificate & Water/Safety Audit Reports',
      };
    default:
      return {
        act: 'Statutory Business Framework',
        section: 'General Regulatory Provision',
        jurisdiction: 'Statutory Compliance Authority',
        reqDoc: 'Official Statutory Certificate & Clearance Acknowledgement',
      };
  }
}

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Object} [props.record]
 * @param {Object} [props.profile]
 * @param {Array} [props.explanations]
 */
export function ComplianceIntelligenceModal({ open, onClose, record, profile, explanations = [] }) {
  if (!record) return null;

  const legal = getLegalMetadata(record.authority);
  const matchingExplanation = explanations.find(
    (e) => e.authority?.toLowerCase() === record.authority?.toLowerCase()
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[11px] font-semibold">
            <CheckCircle size={14} />
            <span>COMPLIANT</span>
          </span>
        );
      case 'DUE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[--radius-sm] bg-[--vc-warning-bg] text-[--vc-warning-text] text-[11px] font-semibold">
            <Clock size={14} />
            <span>DUE SOON</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[--radius-sm] bg-[--vc-error-bg] text-[--vc-error-text] text-[11px] font-semibold">
            <WarningCircle size={14} />
            <span>OVERDUE</span>
          </span>
        );
      case 'EXEMPT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[--radius-sm] bg-[--vc-bg-subtle] text-[--vc-text-tertiary] text-[11px] font-semibold">
            <Prohibit size={14} />
            <span>EXEMPT</span>
          </span>
        );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${record.authority} Statutory Intelligence Workspace`}
      size="xl"
    >
      <div className="flex flex-col gap-6">

        {/* 1. Summary Header Banner */}
        <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={22} className="text-[--vc-brand]" />
              <h3 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
                {record.authority} Statutory Obligations
              </h3>
            </div>
            <p className="text-[--text-xs] text-[--vc-text-secondary]">
              Filing Reference: <span className="font-mono text-[--vc-text-primary] font-semibold">{record.filing_reference || 'REF-STD-SYNC'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(record.status)}
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-bg-subtle] text-[--vc-text-secondary]">
              PRIORITY: {record.priority || 'MEDIUM'}
            </span>
          </div>
        </div>

        {/* 2. Grid Layout: Applicability & Legal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Applicability & Rules Engine Panel */}
          <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
              <Info size={18} className="text-[--vc-brand]" />
              <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                Rules Engine Applicability
              </h4>
            </div>

            <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
              <p className="text-[--text-xs] text-[--vc-text-primary] leading-[--lh-relaxed] font-medium">
                {matchingExplanation?.explanation || record.notes || `${record.authority} compliance rules evaluated for this business.`}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[--vc-text-tertiary] font-mono pt-1">
              <span>Confidence: 100% Deterministic</span>
              <span>Engine: v1.0.0</span>
            </div>
          </div>

          {/* Legal Information Panel */}
          <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
              <Scales size={18} className="text-[--vc-brand]" />
              <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                Statutory Legal Reference
              </h4>
            </div>

            <div className="flex flex-col gap-2 text-[--text-xs]">
              <div>
                <span className="font-bold text-[--vc-text-tertiary] block text-[10px] uppercase">Governing Act</span>
                <span className="text-[--vc-text-primary] font-medium">{legal.act}</span>
              </div>
              <div>
                <span className="font-bold text-[--vc-text-tertiary] block text-[10px] uppercase">Provision & Section</span>
                <span className="text-[--vc-text-secondary]">{legal.section}</span>
              </div>
              <div>
                <span className="font-bold text-[--vc-text-tertiary] block text-[10px] uppercase">Regulatory Body</span>
                <span className="text-[--vc-text-secondary]">{legal.jurisdiction}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Required Documents & Renewal Cycle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Required Documents Panel */}
          <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[--vc-border]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[--vc-brand]" />
                <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                  Required Documents
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[--vc-text-tertiary]">Vault Ready</span>
            </div>

            <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-between">
              <div>
                <span className="text-[--text-xs] font-bold text-[--vc-text-primary] block">{legal.reqDoc}</span>
                <span className="text-[10px] text-[--vc-text-tertiary]">Statutory Certificate Artifact</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text]">
                REQUIRED
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-[--radius-sm] border border-dashed border-[--vc-border] bg-[--vc-bg-base]/50 text-[11px] text-[--vc-text-tertiary]">
              <Vault size={16} className="text-[--vc-brand]" />
              <span>Document Vault integration module prepared for Phase 5.</span>
            </div>
          </div>

          {/* Renewal & Schedule Panel */}
          <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
              <Calendar size={18} className="text-[--vc-brand]" />
              <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                Renewal Cycle & Filing Schedule
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[--text-xs]">
              <div className="p-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase block">Frequency</span>
                <span className="font-mono text-[--vc-text-primary] font-semibold">{record.renewal_frequency || 'ANNUAL'}</span>
              </div>

              <div className="p-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase block">Expiry / Due Date</span>
                <span className="font-mono text-[--vc-text-primary] font-semibold">
                  {record.expiry_date ? new Date(record.expiry_date).toISOString().split('T')[0] : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-[--radius-sm] border border-dashed border-[--vc-border] bg-[--vc-bg-base]/50 text-[11px] text-[--vc-text-tertiary]">
              <BellSimple size={16} className="text-[--vc-brand]" />
              <span>Proactive Reminder Scheduler pipeline ready for 30/15/7 day triggers.</span>
            </div>
          </div>
        </div>

        {/* 4. Evaluated Business Context Panel */}
        {profile && (
          <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
              <Building size={18} className="text-[--vc-brand]" />
              <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                Evaluated Business Context
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[--text-xs]">
              <div>
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase block">Business Name</span>
                <span className="text-[--vc-text-primary] font-medium truncate block">{profile.businessName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase block">Type / Sector</span>
                <span className="text-[--vc-text-primary] font-medium">{profile.businessType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase block">Workforce Count</span>
                <span className="font-mono text-[--vc-text-primary] font-medium">{profile.employeeCount} Employees</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase block">Food Business</span>
                <span className="text-[--vc-text-primary] font-medium">{profile.isFoodBusiness ? 'YES' : 'NO'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Extension Modules Placeholder Bar */}
        <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[--text-xs] text-[--vc-text-secondary]">
            <ChartLine size={18} className="text-[--vc-brand]" />
            <span>Future Modules Prepared: Timeline • Calendar • Document Vault • Compliance Score</span>
          </div>
          <span className="text-[10px] font-mono text-[--vc-text-tertiary]">VerifyChain v1.0.0</span>
        </div>

      </div>
    </Modal>
  );
}
