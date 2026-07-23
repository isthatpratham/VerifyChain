/**
 * SiteFooter.jsx
 * Structured, reusable site footer.
 *
 * Layout (3-column at lg, stacked on mobile):
 *   | Brand + description | Product links | Company links |
 *   | Legal + copyright                                   |
 *
 * DESIGN_SYSTEM.md:
 *   - Structured, not decorative
 *   - No oversized multi-column layouts with unnecessary content
 *   - Spacing: generous but not wasteful
 *   - Typography: xs–sm, tertiary text
 *   - No rounded cards, no excessive color
 *
 * Brand guidelines:
 *   - VerifyChain: enterprise trust platform
 *   - No marketing language in footer
 *   - Professional, concise copy
 */
import { Link } from 'react-router-dom';
import { NavigationLogo } from './NavigationLogo';

const PRODUCT_LINKS = [
  { to: '/dashboard',    label: 'Dashboard'      },
  { to: '/profile',      label: 'Business Profile' },
  { to: '/verification', label: 'Verification'   },
  { to: '/compliance',   label: 'Compliance'     },
];

const COMPANY_LINKS = [
  { to: '/about',   label: 'About'    },
  { to: '/pricing', label: 'Pricing'  },
  { to: '/contact', label: 'Contact'  },
];

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy'  },
  { to: '/terms',   label: 'Terms of Service' },
];

const linkClass =
  'text-[--text-xs] text-[--vc-text-tertiary] hover:text-[--vc-text-secondary] ' +
  'transition-colors duration-[--duration-fast] ' +
  'focus-visible:outline-none focus-visible:underline';

const headingClass =
  'text-[--text-xs] font-semibold text-[--vc-text-secondary] ' +
  'uppercase tracking-[--ls-caps] mb-3';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-[--vc-border] bg-[--vc-bg-base]"
    >
      {/* ── Main grid ── */}
      <div className="max-w-[--container-xl] mx-auto px-5 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr_1fr]">

          {/* ── Brand column ── */}
          <div className="flex flex-col gap-4 max-w-xs">
            <NavigationLogo />
            <p className="text-[--text-xs] text-[--vc-text-tertiary] leading-[--lh-relaxed]">
              VerifyChain provides structured business verification and trust
              scoring for enterprises operating in regulated environments.
            </p>
          </div>

          {/* ── Product links ── */}
          <div>
            <p className={headingClass}>Product</p>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company links ── */}
          <div>
            <p className={headingClass}>Company</p>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {COMPANY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Legal bar ── */}
      <div className="border-t border-[--vc-border]">
        <div className="max-w-[--container-xl] mx-auto px-5 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[--text-xs] text-[--vc-text-tertiary]">
            © {year} VerifyChain. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
