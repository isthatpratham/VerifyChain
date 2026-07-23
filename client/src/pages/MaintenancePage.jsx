/**
 * MaintenancePage.jsx
 * Reusable system page for scheduled maintenance or system updates.
 */
import { Wrench } from '@phosphor-icons/react';
import { Container } from '../layouts/Container';

export function MaintenancePage() {
  return (
    <div className="py-20 lg:py-28 text-center">
      <Container size="sm">
        <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand]">
            <Wrench size={24} />
          </div>

          <span className="px-3 py-1 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-mono font-semibold text-[--vc-brand]">
            SYSTEM STATUS
          </span>

          <h1 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary]">
            Scheduled System Maintenance
          </h1>

          <p className="text-[--text-sm] text-[--vc-text-secondary] max-w-md leading-[--lh-relaxed]">
            VerifyChain is undergoing scheduled system updates to synchronize government regulatory schemas. Normal operations will resume shortly.
          </p>

          <div className="pt-2 text-[--text-xs] font-mono text-[--vc-text-tertiary]">
            Status: Operational Upgrade in Progress
          </div>
        </div>
      </Container>
    </div>
  );
}
