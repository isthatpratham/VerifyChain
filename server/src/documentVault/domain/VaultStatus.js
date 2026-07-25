/**
 * VaultStatus.js
 * Document Vault Status Lifecycle & Auditable Transition Rules.
 */

const VAULT_STATUSES = Object.freeze({
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  ANALYZED: 'ANALYZED',
  VERIFIED: 'VERIFIED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
  RESTORED: 'RESTORED',
});

const ALLOWED_TRANSITIONS = Object.freeze({
  UPLOADING: ['PROCESSING', 'DELETED'],
  PROCESSING: ['ANALYZED', 'REJECTED'],
  ANALYZED: ['VERIFIED', 'REJECTED', 'ARCHIVED'],
  VERIFIED: ['APPROVED', 'REJECTED', 'ARCHIVED'],
  APPROVED: ['ARCHIVED', 'DELETED'],
  REJECTED: ['UPLOADING', 'ARCHIVED', 'DELETED'],
  ARCHIVED: ['RESTORED', 'DELETED'],
  DELETED: ['RESTORED'],
  RESTORED: ['PROCESSING', 'ANALYZED', 'VERIFIED', 'APPROVED', 'ARCHIVED'],
});

function isValidStatus(status) {
  return Object.values(VAULT_STATUSES).includes(status);
}

function canTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

module.exports = {
  VAULT_STATUSES,
  ALLOWED_TRANSITIONS,
  isValidStatus,
  canTransition,
};
