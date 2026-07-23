/**
 * FAQPage.jsx
 * Comprehensive categorised FAQ grounded strictly in project documentation.
 */
import { useState } from 'react';
import { Accordion, AccordionItem } from '../ui/Accordion';
import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';

const MSME_FAQS = [
  {
    q: 'Is VerifyChain free to use for MSME owners?',
    a: 'Yes. VerifyChain is completely free for micro, small, and medium enterprises. It operates as open compliance infrastructure.',
  },
  {
    q: 'What registration numbers do I need to get started?',
    a: 'You only need your primary business registration identifiers—specifically your GSTIN and Udyam Registration Number—along with a valid email address.',
  },
  {
    q: 'How are expiration alerts delivered?',
    a: 'Alerts are delivered automatically 30 days, 15 days, and 7 days prior to any compliance certificate or return filing deadline.',
  },
];

const BUYER_FAQS = [
  {
    q: 'Do enterprise buyers need an account to verify a supplier?',
    a: 'No. Verified Supplier Cards are accessible via public QR codes and URL links with zero authentication or paywalls required.',
  },
  {
    q: 'How long does a supplier verification take?',
    a: 'Less than 30 seconds. Scanning a supplier QR code displays their live status across all 6 regulatory authorities instantly.',
  },
  {
    q: 'Can I download a PDF copy of a supplier certificate?',
    a: 'Yes. The Verified Supplier Profile includes a clean PDF export formatted specifically for procurement audit trails and tender documentation.',
  },
];

const TECH_FAQS = [
  {
    q: 'How is the Compliance Health Score (CHS) calculated?',
    a: 'The score is calculated deterministically on a 0–100 scale using weighted authority rules (GST: 25, EPFO: 20, ESIC: 15, MCA: 15, Udyam: 15, FSSAI: 10). Scores fall into HIGH (75–100), MEDIUM (40–74), or LOW (0–39) tiers.',
  },
  {
    q: 'Are scores stored statically in the database?',
    a: 'No. Scores are never stored statically. They are computed dynamically on every API request from raw compliance records to guarantee fresh data.',
  },
  {
    q: 'What happens if a business is exempt from FSSAI?',
    a: 'If a business is not in the food sector, FSSAI is flagged as EXEMPT. Its 10-point allocation is re-weighted so the total maximum remains 100.',
  },
];

export function FAQPage() {
  const [category, setCategory] = useState('msme');
  const revealRef = useReveal();

  const getFaqs = () => {
    if (category === 'buyer') return BUYER_FAQS;
    if (category === 'tech') return TECH_FAQS;
    return MSME_FAQS;
  };

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
            Documentation FAQ
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] lg:text-[--text-4xl] font-bold text-[--vc-text-primary] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
            Find documented answers regarding platform functionality, scoring algorithms, and buyer verification.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-[--vc-border] pb-4">
          <button
            type="button"
            onClick={() => setCategory('msme')}
            className={[
              'px-4 py-2 rounded-[--radius-sm] text-[--text-sm] font-medium transition-colors duration-[--duration-fast]',
              category === 'msme'
                ? 'bg-[--vc-brand] text-white'
                : 'bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-secondary] hover:text-[--vc-text-primary]',
            ].join(' ')}
          >
            For MSME Owners
          </button>

          <button
            type="button"
            onClick={() => setCategory('buyer')}
            className={[
              'px-4 py-2 rounded-[--radius-sm] text-[--text-sm] font-medium transition-colors duration-[--duration-fast]',
              category === 'buyer'
                ? 'bg-[--vc-brand] text-white'
                : 'bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-secondary] hover:text-[--vc-text-primary]',
            ].join(' ')}
          >
            For Enterprise Buyers
          </button>

          <button
            type="button"
            onClick={() => setCategory('tech')}
            className={[
              'px-4 py-2 rounded-[--radius-sm] text-[--text-sm] font-medium transition-colors duration-[--duration-fast]',
              category === 'tech'
                ? 'bg-[--vc-brand] text-white'
                : 'bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-secondary] hover:text-[--vc-text-primary]',
            ].join(' ')}
          >
            Scoring & Security Architecture
          </button>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl">
          <Accordion defaultValue={`${category}-0`}>
            {getFaqs().map((faq, i) => (
              <AccordionItem
                key={faq.q}
                id={`${category}-${i}`}
                title={faq.q}
              >
                <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                  {faq.a}
                </p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </div>
  );
}
