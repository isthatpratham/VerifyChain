/**
 * FAQSection.jsx
 * Factual FAQ based strictly on PRD, SCORE_ENGINE, and project context.
 * Uses design system Accordion component.
 */
import { Accordion, AccordionItem } from '../../ui/Accordion';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';

const FAQS = [
  {
    question: 'Is VerifyChain completely free for MSMEs?',
    answer: 'Yes. VerifyChain is built as a free citizen-accessible MSME compliance intelligence platform for micro and small enterprises across India.',
  },
  {
    question: 'Which government regulatory authorities are covered?',
    answer: 'VerifyChain tracks compliance status across six primary authorities: Goods & Services Tax (GST), Employees Provident Fund (EPFO), Employee State Insurance (ESIC), Ministry of Corporate Affairs (MCA/ROC), Udyam MSME Registration, and FSSAI Food Safety Licensing.',
  },
  {
    question: 'How is the Compliance Health Score (CHS) computed?',
    answer: 'The score is computed deterministically on a 0–100 scale using weighted rules (GST: 25, EPFO: 20, ESIC: 15, MCA: 15, Udyam: 15, FSSAI: 10). Scores fall into three tiers: HIGH (75–100), MEDIUM (40–74), and LOW (0–39). Every score includes a transparent line-item breakdown.',
  },
  {
    question: 'Do buyers need an account to verify a supplier?',
    answer: 'No. Verified Supplier Cards are accessible via public QR codes and URLs with zero authentication required. Buyers can inspect live status in under 30 seconds.',
  },
  {
    question: 'How does VerifyChain notify owners before compliance expirations?',
    answer: 'Our automated alert engine monitors expiration dates on compliance records and delivers proactive notifications at 30-day, 15-day, and 7-day thresholds prior to expiration.',
  },
  {
    question: 'How does the Government Scheme Matcher work?',
    answer: 'The engine evaluates your enterprise profile—specifically sector, state, and employee count—against 200+ seeded government incentive schemes to highlight eligible programs.',
  },
];

export function FAQSection() {
  const revealRef = useReveal();

  return (
    <section
      id="faq"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-surface-raised]"
    >
      <Container size="xl">
        <div className="max-w-2xl mb-12">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary]">
            Everything You Need to Know About VerifyChain
          </h2>
        </div>

        <div className="max-w-3xl">
          <Accordion defaultValue="faq-0">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                id={`faq-${i}`}
                title={faq.question}
              >
                <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                  {faq.answer}
                </p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
