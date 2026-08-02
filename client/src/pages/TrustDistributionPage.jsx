/**
 * TrustDistributionPage.jsx
 * Trust Distribution Workspace Page.
 * Multi-channel distribution management, QR experience, downloadable assets, and embed snippets.
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
 */
import { useState } from 'react';
import { useTrustDistribution } from '../hooks/useTrustDistribution';
import {
  QrCode,
  DownloadSimple,
  Copy,
  Check,
  ArrowSquareOut,
  ArrowsClockwise,
  Broadcast,
  FilePdf,
  Code,
  ShareNetwork,
  WarningCircle,
} from '@phosphor-icons/react';

export function TrustDistributionPage() {
  const {
    identity,
    qrData,
    shareConfig,
    widgetConfig,
    badgeConfig,
    loading,
    error,
    actionLoading,
    generateQRCode,
    regenerateQRCode,
    generateAssets,
    downloadCertificatePDF,
  } = useTrustDistribution();

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const qrImageUrl = qrData?.qr_image_url || qrData?.qrDataUrl;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-[--vc-text-tertiary]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--vc-brand]" />
        <span className="text-[--text-xs] font-semibold">Loading Trust Distribution Workspace…</span>
      </div>
    );
  }

  // ── API / network error ──
  if (error && !identity) {
    return (
      <div className="p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-error]/30 text-center">
        <WarningCircle size={32} className="mx-auto text-[--vc-error] mb-3" />
        <h2 className="text-[--text-lg] font-bold text-[--vc-text-primary] font-[--font-heading]">Unable to Load Distribution Workspace</h2>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-[--radius-md] bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold text-[--text-xs] transition-colors"
        >
          <ArrowsClockwise size={16} /> Retry
        </button>
      </div>
    );
  }

  // ── Identity initializing ──
  if (!identity) {
    return (
      <div className="p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-warning]/30 text-center">
        <WarningCircle size={32} className="mx-auto text-[--vc-warning] mb-3" />
        <h2 className="text-[--text-lg] font-bold text-[--vc-text-primary] font-[--font-heading]">Distribution Identity Initializing</h2>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 max-w-md mx-auto">
          Your distribution profile is being set up automatically. Please wait a moment and refresh.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-[--radius-md] bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold text-[--text-xs] transition-colors"
        >
          <ArrowsClockwise size={16} /> Refresh
        </button>
      </div>
    );
  }

  const clientUrl = window.location.origin;
  const publicUrl = `${clientUrl}/verify/${identity.public_slug}`;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="p-6 sm:p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-[--radius-sm] bg-[--vc-brand-subtle] border border-[--vc-brand]/20 text-[--vc-brand]">
            <Broadcast size={36} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[--text-2xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
                Trust Distribution Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-[--radius-sm] text-[--text-xs] font-semibold bg-[--vc-success-bg] text-[--vc-success-text] border border-[--vc-success]/20 uppercase tracking-wider font-mono">
                ACTIVE PIPELINE
              </span>
            </div>
            <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1">
              Multi-channel broadcasting platform producing dynamic signed QR codes, certificates, and embeddable widgets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[--radius-md] bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] border border-[--vc-border] text-[--vc-text-primary] text-[--text-xs] font-semibold transition-colors"
          >
            <ArrowSquareOut size={15} /> View Public Portal
          </a>
        </div>
      </div>

      {/* ── Grid Section: QR Code & Distribution Channels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Dynamic Signed QR Engine Card */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[--vc-border] mb-4">
              <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] flex items-center gap-2">
                <QrCode size={18} className="text-[--vc-brand]" /> Signed QR Engine
              </h3>
              <span className="text-[10px] font-mono text-[--vc-text-tertiary]">SVG / PNG</span>
            </div>

            {qrImageUrl ? (
              <div className="flex flex-col items-center justify-center p-4 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border] mb-4">
                <img
                  src={qrImageUrl}
                  alt="Verified QR Code"
                  className="w-44 h-44 object-contain rounded-[--radius-sm]"
                />
                <span className="text-[10px] font-mono text-[--vc-text-tertiary] mt-2">
                  Version {qrData.version || 1} • Dynamic Verification Ring
                </span>
              </div>
            ) : (
              <div className="p-8 text-center bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border] mb-4">
                <p className="text-[--text-xs] text-[--vc-text-secondary]">No active QR Code generated.</p>
                <button
                  onClick={generateQRCode}
                  disabled={actionLoading}
                  className="mt-3 px-4 py-2 rounded-[--radius-md] bg-[--vc-brand] text-white font-semibold text-[--text-xs]"
                >
                  Generate Initial QR Code
                </button>
              </div>
            )}
          </div>

          {qrImageUrl && (
            <div className="space-y-2 pt-2 border-t border-[--vc-border]">
              <a
                href={qrImageUrl}
                download="VerifyChain-QR.png"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-[--radius-md] bg-[--vc-brand] text-white font-semibold text-[--text-xs] hover:bg-[--vc-brand-hover] transition-colors"
              >
                <DownloadSimple size={15} /> Download Signed QR Code
              </a>
              <button
                onClick={regenerateQRCode}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-[--radius-md] bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-primary] font-semibold text-[--text-xs] hover:bg-[--vc-bg-muted] transition-colors disabled:opacity-50"
              >
                <ArrowsClockwise size={15} className={actionLoading ? 'animate-spin' : ''} />
                Regenerate Signed Hash
              </button>
            </div>
          )}
        </div>

        {/* Digital Certificate & PDF Engine */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[--vc-border] mb-4">
              <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] flex items-center gap-2">
                <FilePdf size={18} className="text-[--vc-brand]" /> PDF Verification Certificate
              </h3>
              <span className="text-[10px] font-mono text-[--vc-text-tertiary]">Printable</span>
            </div>

            <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-4">
              Export an official high-resolution, cryptographically verifiable PDF certificate suitable for corporate procurement submissions, RFP responses, and physical display.
            </p>

            <div className="p-4 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] space-y-2 text-[--text-xs] font-mono">
              <div className="flex justify-between">
                <span className="text-[--vc-text-tertiary]">Certificate ID:</span>
                <span className="font-bold text-[--vc-text-primary]">{identity.public_slug.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--vc-text-tertiary]">Issued Status:</span>
                <span className="font-bold text-[--vc-success-text]">VERIFIED & SIGNED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--vc-text-tertiary]">Format:</span>
                <span className="text-[--vc-text-primary]">Vector PDF A4</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[--vc-border]">
            <button
              onClick={downloadCertificatePDF}
              disabled={actionLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-[--radius-md] bg-[--vc-brand] text-white font-semibold text-[--text-xs] hover:bg-[--vc-brand-hover] transition-colors disabled:opacity-50"
            >
              <DownloadSimple size={15} className={actionLoading ? 'animate-spin' : ''} /> Download PDF Certificate
            </button>
          </div>
        </div>

        {/* Shareable Verification Link */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[--vc-border] mb-4">
              <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] flex items-center gap-2">
                <ShareNetwork size={18} className="text-[--vc-brand]" /> Shareable Public URL
              </h3>
              <span className="text-[10px] font-mono text-[--vc-text-tertiary]">Instant Access</span>
            </div>

            <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-4">
              Direct public portal endpoint for enterprise buyers to verify your live statutory compliance standing in real time without authentication barriers.
            </p>

            <div className="p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] font-mono text-[11px] text-[--vc-text-primary] truncate mb-3">
              {publicUrl}
            </div>
          </div>

          <div className="pt-2 border-t border-[--vc-border]">
            <button
              onClick={() => handleCopy(publicUrl, 'url')}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-[--radius-md] bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-primary] font-semibold text-[--text-xs] hover:bg-[--vc-bg-muted] transition-colors"
            >
              {copiedKey === 'url' ? <Check size={15} className="text-[--vc-success]" /> : <Copy size={15} />}
              {copiedKey === 'url' ? 'URL Copied to Clipboard!' : 'Copy Portal URL'}
            </button>
          </div>
        </div>

      </div>

      {/* ── Embed Snippets Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* HTML Embed Snippet */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[--vc-border]">
            <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] flex items-center gap-2">
              <Code size={18} className="text-[--vc-brand]" /> HTML Widget Embed
            </h3>
            <span className="text-[10px] font-mono text-[--vc-text-tertiary]">Iframe / Script</span>
          </div>

          <p className="text-[--text-xs] text-[--vc-text-secondary]">
            Embed your real-time verified supplier trust badge directly into your company website or portal header.
          </p>

          <pre className="p-4 rounded-[--radius-sm] bg-[--vc-bg-inverse] text-emerald-400 font-mono text-[11px] overflow-x-auto border border-[--vc-border]">
            {`<iframe src="${clientUrl}/embed/${identity.public_slug}" width="320" height="180" frameborder="0"></iframe>`}
          </pre>

          <div className="flex justify-end pt-2">
            <button
              onClick={() =>
                handleCopy(
                  `<iframe src="${clientUrl}/embed/${identity.public_slug}" width="320" height="180" frameborder="0"></iframe>`,
                  'iframe'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-md] bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-primary] font-semibold text-[--text-xs] hover:bg-[--vc-bg-muted] transition-colors"
            >
              {copiedKey === 'iframe' ? <Check size={14} className="text-[--vc-success]" /> : <Copy size={14} />}
              {copiedKey === 'iframe' ? 'Copied HTML!' : 'Copy HTML Snippet'}
            </button>
          </div>
        </div>

        {/* React Component Embed Snippet */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[--vc-border]">
            <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] flex items-center gap-2">
              <Code size={18} className="text-[--vc-brand]" /> React Component Embed
            </h3>
            <span className="text-[10px] font-mono text-[--vc-text-tertiary]">JSX Component</span>
          </div>

          <p className="text-[--text-xs] text-[--vc-text-secondary]">
            Clean JSX React integration snippet for embedding the VerifyChain trust component into modern web apps.
          </p>

          <pre className="p-4 rounded-[--radius-sm] bg-[--vc-bg-inverse] text-blue-300 font-mono text-[11px] overflow-x-auto border border-[--vc-border]">
            {`<VerifyChainBadge slug="${identity.public_slug}" mode="enterprise" />`}
          </pre>

          <div className="flex justify-end pt-2">
            <button
              onClick={() =>
                handleCopy(
                  `<VerifyChainBadge slug="${identity.public_slug}" mode="enterprise" />`,
                  'react'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-md] bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-primary] font-semibold text-[--text-xs] hover:bg-[--vc-bg-muted] transition-colors"
            >
              {copiedKey === 'react' ? <Check size={14} className="text-[--vc-success]" /> : <Copy size={14} />}
              {copiedKey === 'react' ? 'Copied JSX!' : 'Copy JSX Snippet'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
