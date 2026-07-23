/**
 * ModulePlaceholdersGrid.jsx
 * Enterprise module card grid for system services.
 */
import { QrCode, Bell, Lightning, HardDrives, Sliders, LockKey } from '@phosphor-icons/react';

export function ModulePlaceholdersGrid() {
  const modules = [
    {
      title: 'Verified Supplier Card & QR Code',
      description: 'Public shareable supplier verification card with scannable QR code for enterprise procurement validation.',
      status: 'Active Infrastructure',
      icon: QrCode,
      badgeColor: 'bg-[--vc-success-bg] text-[--vc-success-text]',
    },
    {
      title: 'Proactive Expiry Notification Engine',
      description: 'Automated notification pipeline delivering warning alerts 30, 15, and 7 days prior to filing deadlines.',
      status: 'Active Engine',
      icon: Bell,
      badgeColor: 'bg-[--vc-success-bg] text-[--vc-success-text]',
    },
    {
      title: 'Government Scheme Matcher',
      description: 'Matches your enterprise sector, state, and employee count against 200+ active government incentive programs.',
      status: 'Engine Ready',
      icon: Lightning,
      badgeColor: 'bg-[--vc-brand-light]/10 text-[--vc-brand]',
    },
    {
      title: 'Encrypted Document Vault',
      description: 'Secure encrypted storage for compliance certificates, licenses, and official statutory documents.',
      status: 'Engine Ready',
      icon: HardDrives,
      badgeColor: 'bg-[--vc-brand-light]/10 text-[--vc-brand]',
    },
    {
      title: 'Enterprise Settings & Access Control',
      description: 'Manage notification preferences, API integrations, security keys, and team access credentials.',
      status: 'Configured',
      icon: Sliders,
      badgeColor: 'bg-[--vc-bg-subtle] text-[--vc-text-secondary]',
    },
    {
      title: 'Security & Audit Log Trail',
      description: 'Immutable verification log recording zero-auth buyer validations and statutory data refreshes.',
      status: 'Active Log',
      icon: LockKey,
      badgeColor: 'bg-[--vc-bg-subtle] text-[--vc-text-secondary]',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[--vc-border]">
        <h2 className="font-[--font-heading] text-[--text-lg] font-bold text-[--vc-text-primary]">
          Platform Modules & Services
        </h2>
        <span className="text-[--text-xs] font-mono text-[--vc-text-tertiary]">
          6 Services Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col justify-between hover:border-[--vc-border-strong] transition-colors duration-[--duration-fast]"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand]">
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] ${mod.badgeColor}`}>
                    {mod.status}
                  </span>
                </div>
                <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
                  {mod.title}
                </h3>
                <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[--vc-border] flex justify-end">
                <span className="text-[11px] font-medium text-[--vc-brand]">
                  Integrated Service
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
