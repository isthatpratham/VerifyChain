/**
 * TrustDistributionPage.jsx
 * Trust Distribution Workspace Page.
 * Multi-channel distribution management, QR experience, downloadable assets, and embed snippets.
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
  } = useTrustDistribution();

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="text-sm font-medium">Loading Trust Distribution Workspace…</span>
      </div>
    );
  }

  // ── API / network error (critical path failed) ──
  if (error && !identity) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-red-100 shadow-sm text-center">
        <WarningCircle size={32} className="mx-auto text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Unable to Load Distribution Workspace</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
        >
          <ArrowsClockwise size={16} /> Retry
        </button>
      </div>
    );
  }

  // ── Identity not yet available — should be transient after auto-init ──
  if (!identity) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-amber-100 shadow-sm text-center">
        <WarningCircle size={32} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Distribution Identity Initializing</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Your distribution profile is being set up automatically. Please wait a moment and refresh.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
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
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <Broadcast size={40} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trust Distribution Hub
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {identity.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Stable ID:{' '}
              <span className="text-slate-700">{identity.stable_distribution_id}</span>
              {' '}·{' '}
              Version: {identity.asset_version || 'v1.0.0'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={generateAssets}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <ArrowsClockwise size={16} className={actionLoading ? 'animate-spin' : ''} />
            {actionLoading ? 'Generating…' : 'Refresh All Assets'}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <ArrowSquareOut size={16} />
            View Public Page
          </a>
        </div>
      </div>

      {/* ── Dynamic QR Experience Section ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shrink-0 flex flex-col items-center gap-2">
          {qrData?.qrDataUrl ? (
            <img src={qrData.qrDataUrl} alt="Dynamic QR Verification Code" className="w-40 h-40 rounded-lg" />
          ) : (
            <div className="w-40 h-40 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
              <QrCode size={40} />
              <span className="text-[10px] font-mono text-slate-400">QR Not Generated</span>
            </div>
          )}
          <span className="text-[10px] font-mono text-slate-400">HMAC-SHA256 Signed Token</span>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <QrCode size={20} className="text-blue-600" />
            Dynamic Verification QR Code
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Scan to instantly verify statutory compliance and supplier identity. Embed on purchase orders, invoices,
            delivery notes, and corporate brochures.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 break-all flex items-center justify-between gap-3">
            <span className="truncate">{qrData?.targetUrl || publicUrl}</span>
            <button
              onClick={() => handleCopy(qrData?.targetUrl || publicUrl, 'qrUrl')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors"
              title="Copy URL"
            >
              {copiedKey === 'qrUrl' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            {!qrData ? (
              <button
                onClick={generateQRCode}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                <QrCode size={14} /> Generate Dynamic QR
              </button>
            ) : (
              <button
                onClick={regenerateQRCode}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowsClockwise size={14} /> Regenerate Token
              </button>
            )}

            {qrData?.qrDataUrl && (
              <a
                href={qrData.qrDataUrl}
                download={`VerifyChain_QR_${identity.public_slug}.png`}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <DownloadSimple size={14} /> Download PNG
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Downloadable Trust Assets Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Printable PDF Certificate Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <FilePdf size={17} />
                Printable Certificate
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                PDF Document
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Statutory Compliance Certificate</h3>
            <p className="text-sm text-slate-500 mt-1">
              High-resolution printable A4 certificate containing official verification seal, issued date, and public
              identifier.
            </p>
          </div>
          <a
            href="/api/trust-distribution/assets/download/certificate"
            download
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <DownloadSimple size={16} /> Download High-Res PDF Certificate
          </a>
        </div>

        {/* Website Verification Widget Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Code size={17} />
                Embeddable Widget
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                Responsive iFrame
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Website Verification Widget</h3>
            <p className="text-sm text-slate-500 mt-1">
              Embed live compliance verification standing directly onto your corporate website footer or contact page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={widgetConfig?.iframeCode || `<iframe src="${clientUrl}/embed/widget/${identity.public_slug}"></iframe>`}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate"
            />
            <button
              onClick={() => handleCopy(widgetConfig?.iframeCode || '', 'widgetCode')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'widgetCode' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Embeddable Trust Badge & Social Share Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Badge Snippet */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Code size={17} /> Embeddable Trust Badge
          </span>
          <p className="text-sm text-slate-500">
            Lightweight SVG &amp; HTML badge code linking directly to your verified standing.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-600 truncate">
              {badgeConfig?.htmlCode || `<a href="${publicUrl}">Verified Supplier</a>`}
            </span>
            <button
              onClick={() => handleCopy(badgeConfig?.htmlCode || '', 'badgeCode')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 transition-colors"
            >
              {copiedKey === 'badgeCode' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Social Share Links */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <ShareNetwork size={17} /> Social Share Links
          </span>
          <p className="text-sm text-slate-500">
            Share your verified profile across professional channels with pre-configured OpenGraph metadata.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {shareConfig?.socialShare?.whatsapp ? (
              <a
                href={shareConfig.socialShare.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
              >
                WhatsApp
              </a>
            ) : (
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Verify my business on VerifyChain: ${publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
              >
                WhatsApp
              </a>
            )}
            {shareConfig?.socialShare?.linkedin ? (
              <a
                href={shareConfig.socialShare.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
              >
                LinkedIn
              </a>
            ) : (
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
              >
                LinkedIn
              </a>
            )}
            {shareConfig?.socialShare?.twitter ? (
              <a
                href={shareConfig.socialShare.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors"
              >
                X (Twitter)
              </a>
            ) : (
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent('Verified Supplier Profile on VerifyChain')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors"
              >
                X (Twitter)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
