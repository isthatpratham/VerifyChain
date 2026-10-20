/**
 * urlResolver.js
 * Centralized Canonical Public URL Resolver for VerifyChain Frontend.
 *
 * Guarantees:
 * - Uses explicitly configured public origin (VITE_APP_URL) if defined.
 * - In browser environment, defaults cleanly to the deployed window.location.origin.
 * - In test/build, defaults to a safe fallback.
 * - Strips trailing slashes and normalizes paths.
 * - Centralizes verification, widget, badge, and share URL generation.
 */

/**
 * Normalize and strip trailing slash from a base URL
 * @param {string} url
 * @returns {string}
 */
export function normalizeOrigin(url) {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/+$/, '');
}

/**
 * Get canonical public frontend origin for the application
 * @returns {string}
 */
export function getPublicAppUrl() {
  const envUrl =
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_PUBLIC_URL ||
    import.meta.env.VITE_CLIENT_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return normalizeOrigin(envUrl);
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return normalizeOrigin(window.location.origin);
  }

  return 'http://localhost:3000';
}

/**
 * Build canonical public verification portal URL
 * @param {string} slug
 * @param {string} [token]
 * @returns {string}
 */
export function getVerificationUrl(slug, token = null) {
  if (!slug) return getPublicAppUrl();
  const base = getPublicAppUrl();
  const cleanSlug = encodeURIComponent(slug);
  if (token) {
    return `${base}/verify/${cleanSlug}?token=${encodeURIComponent(token)}`;
  }
  return `${base}/verify/${cleanSlug}`;
}

/**
 * Build embeddable website widget URL
 * @param {string} slug
 * @returns {string}
 */
export function getWidgetIframeUrl(slug) {
  if (!slug) return getPublicAppUrl();
  const base = getPublicAppUrl();
  return `${base}/embed/widget/${encodeURIComponent(slug)}`;
}

/**
 * Generate standard HTML iframe embed code for website widget
 * @param {string} slug
 * @param {string} [businessName]
 * @returns {string}
 */
export function getWidgetIframeSnippet(slug, businessName = 'Verified Supplier') {
  const src = getWidgetIframeUrl(slug);
  const cleanName = String(businessName).replace(/"/g, '&quot;');
  return `<iframe src="${src}" width="380" height="240" frameborder="0" scrolling="no" style="border: 0; border-radius: 12px; overflow: hidden;" title="${cleanName} VerifyChain Trust Widget"></iframe>`;
}

/**
 * Build social share links
 * @param {string} slug
 * @param {string} [businessName]
 * @returns {{ whatsapp: string, linkedin: string, twitter: string }}
 */
export function getSocialShareUrls(slug, businessName = 'Verified Supplier') {
  const url = getVerificationUrl(slug);
  const name = businessName || 'Verified Supplier';

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Verify ${name} on VerifyChain: ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Verified Supplier Profile for ${name} on VerifyChain`)}`,
  };
}
