/**
 * EmbeddableTrustWidget.jsx
 * Standalone embeddable website verification widget component.
 * Rendered at route /embed/widget/:slug for third-party website integrations.
 */
import { useParams, Link } from 'react-router-dom';
import { usePublicTrust } from '../../hooks/usePublicTrust';
import { ShieldCheck, CheckCircle, Certificate } from '@phosphor-icons/react';

export function EmbeddableTrustWidget() {
  const { slug } = useParams();
  const { profile, loading, error } = usePublicTrust(slug);

  if (loading) {
    return (
      <div className="p-4 bg-neutral-950 text-neutral-400 text-xs font-mono flex items-center gap-2 rounded-xl border border-neutral-800">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400" />
        <span>Verifying Standing...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4 bg-neutral-950 text-red-400 text-xs font-mono rounded-xl border border-red-500/20">
        Supplier Profile Restricted or Not Found
      </div>
    );
  }

  const trustLevel = profile.trust_level || 'VERIFIED';
  const score = profile.trust_score_snapshot || 85;

  return (
    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 font-sans shadow-lg max-w-sm">
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="font-bold text-xs tracking-tight text-neutral-100">{profile.display_name}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <Certificate size={12} />
          {trustLevel}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-mono">Verification Status</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle size={12} />
            {profile.verification_state}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-mono">Rating</span>
          <span className="font-mono font-extrabold text-neutral-100">{score} / 100</span>
        </div>
      </div>

      <Link
        to={`/verify/${profile.public_slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-1.5 text-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 transition-colors"
      >
        Verify Public Identity on VerifyChain &rarr;
      </Link>
    </div>
  );
}
