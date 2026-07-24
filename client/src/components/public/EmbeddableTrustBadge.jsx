/**
 * EmbeddableTrustBadge.jsx
 * Standalone embeddable trust badge page.
 * Rendered at route /embed/badge/:slug.
 */
import { useParams, Link } from 'react-router-dom';
import { usePublicTrust } from '../../hooks/usePublicTrust';
import { Certificate } from '@phosphor-icons/react';

export function EmbeddableTrustBadge() {
  const { slug } = useParams();
  const { profile, loading, error } = usePublicTrust(slug);

  if (loading || error || !profile) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-mono">
        <Certificate size={14} className="text-neutral-500" />
        <span>VerifyChain Badge</span>
      </div>
    );
  }

  const trustLevel = profile.trust_level || 'VERIFIED';

  return (
    <Link
      to={`/verify/${profile.public_slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-emerald-500/30 text-neutral-100 text-xs font-sans shadow-md transition-all group"
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-bold text-neutral-100">{profile.display_name}</span>
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        {trustLevel}
      </span>
      <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 transition-colors font-mono">
        VerifyChain &rarr;
      </span>
    </Link>
  );
}
