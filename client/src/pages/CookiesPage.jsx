/**
 * CookiesPage.jsx
 * Standardized Cookie Policy document for VerifyChain.
 */
import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';

export function CookiesPage() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="md">
        <div className="mb-8 pb-6 border-b border-[--vc-border]">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
            Legal Compliance Document
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] font-bold text-[--vc-text-primary] mb-2">
            Cookie Policy
          </h1>
          <p className="text-[--text-xs] text-[--vc-text-tertiary]">
            Last Updated: July 2026 • Status: Draft (Pending Final Counsel Review)
          </p>
        </div>

        <div className="prose max-w-none text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed] flex flex-col gap-6">
          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              1. Essential Cookies Only
            </h3>
            <p>
              VerifyChain uses strictly necessary cookies and local storage tokens to preserve authenticated session state and user navigation preferences. We do not use intrusive third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              2. Session Token Storage
            </h3>
            <p>
              When logging into your account, an encrypted JSON Web Token (JWT) is stored securely to maintain your active session across navigation routes. Session tokens automatically expire upon logging out or after inactivity timeouts.
            </p>
          </section>

          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              3. Managing Cookie Preferences
            </h3>
            <p>
              You can configure your browser settings to block or notify you regarding local cookie storage. Note that disabling essential session cookies will prevent access to authenticated dashboard features.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
