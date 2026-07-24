/**
 * QuickActionsPanel.jsx
 * Compact enterprise quick actions grid for key platform tasks.
 */
import { Link } from 'react-router-dom';
import { PencilSimple, ShieldCheck, Broadcast, ArrowSquareOut, CheckCircle } from '@phosphor-icons/react';

export function QuickActionsPanel({ publicSlug }) {
  const actions = [
    {
      title: 'Edit Business Profile',
      desc: 'Update GSTIN, Udyam & scale details',
      to: '/profile',
      icon: PencilSimple,
      badge: 'Profile',
    },
    {
      title: 'Supplier Trust Workspace',
      desc: 'View executive standing & factors',
      to: '/supplier-trust',
      icon: ShieldCheck,
      badge: 'Trust',
    },
    {
      title: 'Trust Distribution Hub',
      desc: 'Generate QR codes, badges & certificates',
      to: '/trust-distribution',
      icon: Broadcast,
      badge: 'Distribution',
    },
    {
      title: 'Open Public Profile',
      desc: 'View public buyer verification portal',
      to: publicSlug ? `/verify/${publicSlug}` : '/dashboard',
      external: true,
      icon: ArrowSquareOut,
      badge: 'Public',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[--vc-border]">
        <h2 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary] flex items-center gap-2">
          <CheckCircle size={18} className="text-[--vc-brand]" />
          Quick Actions & Operations
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          const content = (
            <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] hover:border-[--vc-border-strong] transition-all group shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-center text-[--vc-brand] group-hover:bg-[--vc-brand-light]/10 transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[--vc-bg-base] text-[--vc-text-tertiary] border border-[--vc-border]">
                    {act.badge}
                  </span>
                </div>
                <h3 className="font-[--font-heading] text-[--text-xs] font-bold text-[--vc-text-primary] group-hover:text-[--vc-brand] transition-colors">
                  {act.title}
                </h3>
                <p className="text-[11px] text-[--vc-text-secondary] mt-0.5 leading-snug">
                  {act.desc}
                </p>
              </div>
            </div>
          );

          return act.external ? (
            <a key={act.title} href={act.to} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <Link key={act.title} to={act.to}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
