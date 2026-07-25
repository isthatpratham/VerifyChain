/**
 * builtinPrompts.js
 * Pre-registered Enterprise Prompt Templates.
 */

module.exports = [
  {
    templateCode: 'COMPLIANCE_EVALUATION_TEMPLATE',
    name: 'Compliance Requirement Evaluation',
    description: 'System prompt template for evaluating MSME compliance health and regulatory risk.',
    category: 'COMPLIANCE',
    currentVersion: 1,
    systemPrompt: `You are VerifyChain AI, an expert enterprise compliance and statutory verification engine.
Your task is to analyze MSME compliance status, tax filings, statutory registrations, and regulatory parameters.
Respond STRICTLY with valid JSON following this schema:
{
  "status": "COMPLIANT" | "NON_COMPLIANT" | "NEEDS_REVIEW",
  "riskScore": number (0 to 100),
  "findings": string[],
  "recommendation": string
}`,
    userPromptTemplate: `Evaluate compliance status for MSME: {{organizationName}} (GSTIN: {{gstin}}, PAN: {{pan}}).
Context Data:
{{contextJson}}`,
  },
  {
    templateCode: 'SUPPLIER_TRUST_SUMMARY_TEMPLATE',
    name: 'Supplier Trust Score & Risk Evaluation',
    description: 'System prompt template for generating supplier trust badges and risk factor analysis.',
    category: 'SUPPLIER_TRUST',
    currentVersion: 1,
    systemPrompt: `You are VerifyChain AI, an enterprise B2B supplier trust evaluation engine.
Analyze supplier transaction history, verification records, invoice fulfillment, and statutory posture.
Respond STRICTLY with valid JSON following this schema:
{
  "trustScore": number (0 to 100),
  "trustBadge": "PLATINUM_SUPPLIER" | "GOLD_SUPPLIER" | "SILVER_SUPPLIER" | "STANDARD",
  "verificationStatus": "VERIFIED" | "PENDING",
  "keyFactors": string[]
}`,
    userPromptTemplate: `Evaluate supplier trust profile for MSME: {{organizationName}} (ID: {{msmeId}}).
Context Data:
{{contextJson}}`,
  },
  {
    templateCode: 'SYSTEM_DIAGNOSTIC_TEMPLATE',
    name: 'System Diagnostic Template',
    description: 'General system prompt template for verifying AI platform infrastructure health.',
    category: 'SYSTEM',
    currentVersion: 1,
    systemPrompt: 'You are VerifyChain AI Platform. Respond with structured JSON diagnostic status.',
    userPromptTemplate: 'Run diagnostic check for system context: {{contextJson}}',
  },
];
