/**
 * urlResolver.js
 * Centralized Canonical Public URL Resolver.
 *
 * Resolves the canonical public frontend origin for QR codes, share links,
 * embed badges, widget iframes, and public verification destinations.
 *
 * Guarantees:
 * - Uses explicitly configured production frontend origin as authoritative source.
 * - In production, strictly requires HTTPS and fails clearly if unconfigured (never falls back to localhost).
 * - In development/test, provides a safe localhost default.
 * - Normalizes URLs by trimming and stripping trailing slashes.
 * - Rejects malformed URLs.
 * - Provides origin validation for secure, non-wildcard CORS handling.
 */

/**
 * Normalize and validate a public URL string.
 * @param {string} rawUrl
 * @param {boolean} requireHttps
 * @returns {string} Normalized origin (protocol + host, no trailing slash)
 */
function normalizeUrl(rawUrl, requireHttps = false) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  const trimmed = rawUrl.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    throw new Error(`Malformed public application URL: "${rawUrl}"`);
  }

  if (requireHttps && parsed.protocol !== 'https:') {
    throw new Error(
      `Insecure public application URL: "${rawUrl}". Production canonical URLs must use HTTPS.`
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported URL protocol "${parsed.protocol}". Must be http: or https:.`);
  }

  // Strip trailing slashes and return clean origin or base URL without trailing slash
  return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, '');
}

/**
 * Resolve the canonical public frontend origin.
 * @returns {string} e.g. "https://verifychain.com" or "http://localhost:3000"
 */
function getCanonicalClientUrl() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowInsecureHttp = process.env.ALLOW_INSECURE_HTTP === 'true';

  // 1. Explicit configuration (highest priority)
  if (process.env.CLIENT_URL) {
    return normalizeUrl(process.env.CLIENT_URL, isProduction && !allowInsecureHttp);
  }

  if (process.env.APP_URL) {
    return normalizeUrl(process.env.APP_URL, isProduction && !allowInsecureHttp);
  }

  // 2. Vercel System Environment Variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const raw = process.env.VERCEL_PROJECT_PRODUCTION_URL.startsWith('http')
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    return normalizeUrl(raw, isProduction && !allowInsecureHttp);
  }

  if (process.env.VERCEL_URL) {
    const raw = process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return normalizeUrl(raw, isProduction && !allowInsecureHttp);
  }

  // 3. Fallback logic: strictly forbidden in production
  if (isProduction) {
    throw new Error(
      '[Config Error] Canonical public frontend origin (CLIENT_URL or VERCEL_URL) must be configured in production. Never falling back to localhost.'
    );
  }

  // Local development / testing default
  return 'http://localhost:3000';
}

/**
 * Construct public verification link
 * @param {string} slug
 * @param {string} [token]
 * @returns {string}
 */
function resolveVerificationUrl(slug, token = null) {
  if (!slug) throw new Error('Public slug is required to resolve verification URL');
  const base = getCanonicalClientUrl();
  const cleanSlug = encodeURIComponent(slug);
  if (token) {
    return `${base}/verify/${cleanSlug}?token=${encodeURIComponent(token)}`;
  }
  return `${base}/verify/${cleanSlug}`;
}

/**
 * Construct website verification widget iframe URL
 * @param {string} slug
 * @returns {string}
 */
function resolveWidgetUrl(slug) {
  if (!slug) throw new Error('Public slug is required to resolve widget URL');
  const base = getCanonicalClientUrl();
  return `${base}/embed/widget/${encodeURIComponent(slug)}`;
}

/**
 * Construct embeddable widget iframe snippet
 * @param {string} slug
 * @param {string} [displayName]
 * @returns {string}
 */
function resolveWidgetIframeCode(slug, displayName = 'Verified Supplier') {
  const widgetUrl = resolveWidgetUrl(slug);
  const cleanName = String(displayName).replace(/"/g, '&quot;');
  return `<iframe src="${widgetUrl}" width="380" height="240" frameborder="0" scrolling="no" style="border: 0; border-radius: 12px; overflow: hidden;" title="${cleanName} VerifyChain Trust Widget"></iframe>`;
}

/**
 * Construct embeddable badge HTML code
 * @param {string} slug
 * @param {string} badgeSvg
 * @returns {string}
 */
function resolveBadgeHtmlCode(slug, badgeSvg) {
  const verifyUrl = resolveVerificationUrl(slug);
  return `<a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" title="Verify Supplier Standing on VerifyChain">\n  ${badgeSvg}\n</a>`;
}

/**
 * Construct deep link URL
 * @param {string} slug
 * @param {string} [section='overview']
 * @returns {string}
 */
function resolveDeepLinkUrl(slug, section = 'overview') {
  const base = getCanonicalClientUrl();
  const cleanSlug = encodeURIComponent(slug);
  const cleanSection = encodeURIComponent(section);
  return `${base}/verify/${cleanSlug}#${cleanSection}`;
}

/**
 * Get all allowed CORS origins
 * @returns {string[]}
 */
function getAllowedCorsOrigins() {
  const allowed = new Set();

  try {
    const canonical = getCanonicalClientUrl();
    if (canonical) allowed.add(canonical);
  } catch (err) {
    // If unresolvable at startup, continue with explicit origins
  }

  // Parse additional CORS_ORIGINS from env if provided
  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .forEach((o) => {
        try {
          allowed.add(normalizeUrl(o));
        } catch (_corsErr) {
          // Ignore invalid custom origin entries
        }
      });
  }

  // Always allow local dev origins in non-production
  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
    allowed.add('http://localhost:5173');
    allowed.add('http://127.0.0.1:5173');
  }

  return Array.from(allowed);
}

/**
 * Verify whether an incoming origin is permitted by CORS policy
 * @param {string|undefined} origin
 * @returns {boolean}
 */
function isAllowedOrigin(origin) {
  // Allow requests without Origin (curl, serverless same-origin, mobile apps)
  if (!origin) return true;

  const allowedOrigins = getAllowedCorsOrigins();
  if (allowedOrigins.includes(origin)) return true;

  try {
    const parsed = new URL(origin);

    // In non-production, allow all localhost ports
    if (process.env.NODE_ENV !== 'production') {
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return true;
      }
    }

    // Allow Vercel preview deployment origins if Vercel deployment
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      if (parsed.hostname.endsWith('.vercel.app')) {
        return true;
      }
    }
  } catch (_) {
    return false;
  }

  return false;
}

module.exports = {
  normalizeUrl,
  getCanonicalClientUrl,
  resolveVerificationUrl,
  resolveWidgetUrl,
  resolveWidgetIframeCode,
  resolveBadgeHtmlCode,
  resolveDeepLinkUrl,
  getAllowedCorsOrigins,
  isAllowedOrigin,
};
