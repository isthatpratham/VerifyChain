/**
 * Landing.jsx
 * VerifyChain Landing Page — Complete Storytelling Experience.
 *
 * Assembly order:
 *   1. HeroSection (Interactive 3D Trust Vault, Parallax background)
 *   2. ProblemSection (3-Part MSME Compliance Challenge)
 *   3. HowItWorksSection (3-Step Aggregation & Scoring Workflow)
 *   4. ScoreEngineSection (Deterministic 0-100 CHS Specification)
 *   5. VerificationProcessSection (Verified Supplier Card & QR Flow)
 *   6. WhyBusinessesNeedItSection (Dual MSME & Buyer Value)
 *   7. EnterpriseFeaturesSection (Proactive Alerts, Scheme Matcher, Document Vault)
 *   8. FAQSection (Factual Q&A Accordion)
 *   9. CTASection (Measured Action Banner)
 */
import { HeroSection } from './landing/HeroSection';
import { ProblemSection } from './landing/ProblemSection';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { ScoreEngineSection } from './landing/ScoreEngineSection';
import { VerificationProcessSection } from './landing/VerificationProcessSection';
import { WhyBusinessesNeedItSection } from './landing/WhyBusinessesNeedItSection';
import { EnterpriseFeaturesSection } from './landing/EnterpriseFeaturesSection';
import { FAQSection } from './landing/FAQSection';
import { CTASection } from './landing/CTASection';

export default function Landing() {
  return (
    <div className="w-full bg-[--vc-bg-base] text-[--vc-text-primary] selection:bg-[--color-prussian-100] selection:text-[--color-prussian-900]">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <ScoreEngineSection />
      <VerificationProcessSection />
      <WhyBusinessesNeedItSection />
      <EnterpriseFeaturesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
