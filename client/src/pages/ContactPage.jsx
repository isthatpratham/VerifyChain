/**
 * ContactPage.jsx
 * Professional contact form & support channels.
 */
import { useState } from 'react';
import { EnvelopeSimple, PaperPlaneRight } from '@phosphor-icons/react';
import { Field } from '../ui/form/Field';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const revealRef = useReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">

          {/* Left Column — Context & Support Channels */}
          <div>
            <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
              Contact & Support
            </span>
            <h1 className="font-[--font-heading] text-[--text-3xl] lg:text-[--text-4xl] font-bold text-[--vc-text-primary] mb-4">
              Get in Touch with VerifyChain Team
            </h1>
            <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-8">
              Have questions regarding business verification, scoring rules, or platform integration? Reach out to our technical support team.
            </p>

            <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-brand]">
                  <EnvelopeSimple size={20} />
                </div>
                <div>
                  <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                    Technical Support Email
                  </h4>
                  <p className="text-[--text-xs] font-mono text-[--vc-text-secondary]">
                    support@verifychain.in
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[--vc-border] text-[--text-xs] text-[--vc-text-tertiary] leading-[--lh-relaxed]">
                For enterprise API access, bulk verification requests, or government scheme data updates, please fill out the contact form.
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
            {submitted ? (
              <Alert variant="success" title="Message Received">
                Thank you for contacting VerifyChain. Your inquiry has been logged and our support team will respond within 24 hours.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Your Name" htmlFor="name" required>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Ramesh Gupta"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>

                  <Field label="Email Address" htmlFor="email" required>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. ramesh@textiles.in"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Subject" htmlFor="subject" required>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="e.g. Business Verification Inquiry"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </Field>

                <Field label="Message" htmlFor="message" required hint="Provide relevant enterprise details or questions">
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Type your message here..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </Field>

                <Button type="submit" variant="primary" loading={loading} icon={<PaperPlaneRight size={16} />}>
                  Send Inquiry
                </Button>
              </form>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}
