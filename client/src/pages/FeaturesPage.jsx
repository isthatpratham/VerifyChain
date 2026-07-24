/**
 * FeaturesPage.jsx
 * Platform capabilities grouped by regulatory domain and system engine.
 */
import { ShieldCheck, Bell, Lightning, FileText, CheckCircle, Database } from '@phosphor-icons/react';
import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';



const DOMAIN_FEATURES = [
  {
    domain: 'Goods & Services Tax (GST)',
    weight: '25 Points',
    description: 'Tracks filing frequency (GSTR-1, GSTR-3B), registration status (Active/Suspended/Cancelled), and tax payment compliance.',
    checks: ['Registration status verification', 'Filing history validation', 'Tax return timeliness score'],
  },
  {
    domain: 'Employees Provident Fund (EPFO)',
    weight: '20 Points',
    description: 'Monitors ECR monthly remittance filings, establishment registration status, and workforce coverage.',
    checks: ['ECR return filing audit', 'Establishment code validation', 'Labour law compliance check'],
  },
  {
    domain: 'Employee State Insurance (ESIC)',
    weight: '15 Points',
    description: 'Validates ESIC code registration, employee contribution filings, and social security compliance.',
    checks: ['Employer code verification', 'Contribution return status', 'Social security coverage rating'],
  },
  {
    domain: 'Ministry of Corporate Affairs (MCA)',
    weight: '15 Points',
    description: 'Monitors DIN status, AOC-4 / MGT-7 annual filings, and corporate standing for registered companies.',
    checks: ['Company Master Data status', 'Annual return filing history', 'Director identification check'],
  },
  {
    domain: 'Udyam MSME Registration',
    weight: '15 Points',
    description: 'Verifies official Udyam Registration Certificate number, enterprise classification (Micro/Small/Medium), and state jurisdiction.',
    checks: ['NIC code mapping', 'Enterprise scale verification', 'State jurisdiction match'],
  },
  {
    domain: 'FSSAI Food Safety License',
    weight: '10 Points',
    description: 'Checks food business operating license status, validity period, and hygiene classification for applicable food MSMEs.',
    checks: ['License validity tracking', 'Exemption verification', 'Category classification audit'],
  },
];

export function FeaturesPage() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
            Platform Features
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] lg:text-[--text-4xl] font-bold text-[--vc-text-primary] mb-4">
            Compliance Intelligence Framework
          </h1>
          <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
            VerifyChain aggregates regulatory data across six Indian government authorities into a single, deterministic score engine.
          </p>
        </div>

        {/* Regulatory Domain Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {DOMAIN_FEATURES.map((f) => (
            <div
              key={f.domain}
              className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[11px] font-mono font-semibold text-[--vc-brand]">
                    {f.weight}
                  </span>
                  <ShieldCheck size={18} className="text-[--vc-brand]" />
                </div>
                <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
                  {f.domain}
                </h3>
                <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-4">
                  {f.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[--vc-border] flex flex-col gap-1.5">
                {f.checks.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-[11px] text-[--vc-text-tertiary]">
                    <CheckCircle size={12} className="text-[--vc-brand] flex-shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Core System Engine Capabilities */}
        <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base]">
          <h2 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary] mb-6">
            System Capabilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <Bell size={20} className="text-[--vc-brand]" />
              <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                Proactive Expiry Engine
              </h4>
              <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                Sends automated notifications 30, 15, and 7 days before compliance renewals.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Lightning size={20} className="text-[--vc-brand]" />
              <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                Scheme Matcher
              </h4>
              <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                Evaluates state, sector, and scale against 200+ seeded government subsidy programs.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Database size={20} className="text-[--vc-brand]" />
              <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                Deterministic Engine
              </h4>
              <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                Scores are computed freshly from raw records without machine learning bias.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <FileText size={20} className="text-[--vc-brand]" />
              <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                Verified Supplier Card
              </h4>
              <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                Zero-auth QR code profile for instant procurement verification by enterprise buyers.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
