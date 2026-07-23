/**
 * TermsPage.jsx
 * Standardized Terms of Service document for VerifyChain.
 */
import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';

export function TermsPage() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="md">
        <div className="mb-8 pb-6 border-b border-[--vc-border]">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
            Legal Compliance Document
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] font-bold text-[--vc-text-primary] mb-2">
            Terms of Service
          </h1>
          <p className="text-[--text-xs] text-[--vc-text-tertiary]">
            Last Updated: July 2026 • Status: Draft (Pending Final Counsel Review)
          </p>
        </div>

        <div className="prose max-w-none text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed] flex flex-col gap-6">
          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              1. Platform Usage & Scope
            </h3>
            <p>
              VerifyChain is provided as a free compliance intelligence platform for micro, small, and medium enterprises. Users agree to provide accurate registration details (GSTIN, Udyam) and maintain lawful operational practices.
            </p>
          </section>

          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              2. Accuracy of Compliance Health Score
            </h3>
            <p>
              The Compliance Health Score (CHS) is an automated, rule-based output derived from regulatory records. While computed deterministically, VerifyChain does not replace legal or financial counsel and users are advised to verify statutory returns independently.
            </p>
          </section>

          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              3. User Responsibilities
            </h3>
            <p>
              Users must preserve account credential security and notify the platform immediately regarding unauthorized access. Misrepresentation of enterprise ownership or fraudulent upload of altered documents is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="font-[--font-heading] text-[--text-base] font-semibold text-[--vc-text-primary] mb-2">
              4. Service Availability
            </h3>
            <p>
              VerifyChain strives to maintain continuous service availability, but is not liable for intermittent delays resulting from third-party government portal API maintenance or network interruptions.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
