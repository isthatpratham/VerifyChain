/**
 * VaultCategory.js
 * Document Vault Logical Categories & Types.
 */

const VAULT_CATEGORIES = Object.freeze({
  BUSINESS: 'BUSINESS',
  COMPLIANCE: 'COMPLIANCE',
  LEGAL: 'LEGAL',
  FINANCIAL: 'FINANCIAL',
  IDENTITY: 'IDENTITY',
  SUPPLIER: 'SUPPLIER',
  AI_REPORT: 'AI_REPORT',
  EXECUTIVE: 'EXECUTIVE',
  AUDIT: 'AUDIT',
  TRUST: 'TRUST',
  SYSTEM: 'SYSTEM',
  CUSTOM: 'CUSTOM',
});

function isValidCategory(category) {
  return Object.values(VAULT_CATEGORIES).includes(category);
}

module.exports = {
  VAULT_CATEGORIES,
  isValidCategory,
};
