/**
 * DashboardHeader.jsx
 * Enterprise Dashboard Header with welcome greeting, business name, sync status, and professional sign out.
 */
import { ShieldCheck, ArrowClockwise, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';

/**
 * @param {Object} props
 * @param {string} [props.userName]
 * @param {string} [props.businessName]
 * @param {string} [props.lastSync]
 * @param {Function} [props.onSync]
 * @param {boolean} [props.syncing]
 */
export function DashboardHeader({
  userName,
  businessName,
  lastSync,
  onSync,
  syncing = false,
}) {
  const { logout } = useAuth();

  const formattedSync = lastSync
    ? new Date(lastSync).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Live Sync Active';

  return (
    <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-[--vc-brand]" />
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand]">
            Enterprise Compliance Intelligence
          </span>
        </div>
        <h1 className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-text-primary]">
          {businessName || 'MSME Enterprise Dashboard'}
        </h1>
        {userName && (
          <p className="text-[--text-xs] text-[--vc-text-secondary] mt-0.5">
            Welcome back, <span className="font-medium text-[--vc-text-primary]">{userName}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[--vc-border]">
        <div className="text-right hidden sm:block">
          <span className="block text-[10px] uppercase tracking-wider text-[--vc-text-tertiary]">
            Last Synchronization
          </span>
          <span className="font-mono text-[--text-xs] font-medium text-[--vc-text-secondary]">
            {formattedSync}
          </span>
        </div>

        {onSync && (
          <button
            type="button"
            onClick={onSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-medium text-[--vc-text-primary] hover:bg-[--vc-bg-subtle] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
          >
            <ArrowClockwise size={14} className={syncing ? 'animate-spin text-[--vc-brand]' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Records'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={logout}
          title="Sign out of account"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-sm] border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[--text-xs] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <SignOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
