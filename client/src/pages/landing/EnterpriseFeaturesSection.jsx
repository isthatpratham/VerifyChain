/**
 * EnterpriseFeaturesSection.jsx
 * Grid highlighting key engine features.
 */
import { Bell, HardDrives, ShieldCheck, Lightning, FileText, CheckSquare } from '@phosphor-icons/react';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';

const FEATURES = [
  {
    icon: Bell,
    title: 'Proactive Expiry Alerts',
    desc: 'Automated notification engine triggers 30, 15, and 7 days prior to any compliance expiration date.',
  },
  {
    icon: Lightning,
    title: 'Government Scheme Matcher',
    desc: 'Matches your enterprise sector, state, and employee count against 200+ active government incentive schemes.',
  },
  {
    icon: ShieldCheck,
    title: 'Rule-Based Determinism',
    desc: 'Scores are computed freshly from raw records on every request without black-box statistical models.',
  },
  {
    icon: HardDrives,
    title: 'Secure Document Vault',
    desc: 'Local encrypted document storage linked to compliance records with strict access controls.',
  },
  {
    icon: FileText,
    title: 'Printable Certificate PDF',
    desc: 'Export formal verified supplier certificates formatted specifically for tender submissions.',
  },
  {
    icon: CheckSquare,
    title: 'Zero-Auth Public Access',
    desc: 'Buyers inspect live verified supplier cards directly without registering or creating accounts.',
  },
];

export function EnterpriseFeaturesSection() {
  const revealRef = useReveal();

  return (
    <section
      id="features"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-bg-base]"
    >
      <Container size="xl">
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
            Engine Capabilities
          </span>
          <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary]">
            Enterprise-Grade Platform Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] hover:border-[--vc-border-strong] transition-colors duration-[--duration-fast]"
              >
                <div className="w-9 h-9 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-subtle] flex items-center justify-center text-[--vc-brand] mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
                  {f.title}
                </h3>
                <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
