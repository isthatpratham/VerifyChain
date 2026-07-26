/**
 * RecordsManagementService.js
 * Master Orchestration Engine for Enterprise Records Governance & Lifecycle (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');
const RetentionPolicyEngine = require('./RetentionPolicyEngine');
const PolicyAssignmentService = require('./PolicyAssignmentService');
const LegalHoldService = require('./LegalHoldService');
const ArchiveService = require('./ArchiveService');
const DispositionService = require('./DispositionService');
const GovernanceDashboardService = require('./GovernanceDashboardService');

const LIFECYCLE_STATES = [
  'DRAFT',
  'ACTIVE',
  'REVIEWED',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
  'RETENTION_ACTIVE',
  'RETENTION_EXPIRED',
  'LEGAL_HOLD',
  'PENDING_DISPOSITION',
  'DISPOSED',
  'DESTROYED',
];

class RecordsManagementService {
  /**
   * Transition Asset Document Lifecycle State
   */
  static async transitionLifecycle({ assetId, targetState, actorId = 'SYSTEM', msmeId = 1 }, client = defaultPrisma) {
    const formattedState = targetState.toUpperCase();
    if (!LIFECYCLE_STATES.includes(formattedState)) {
      throw new Error(`Invalid lifecycle state '${targetState}'. Supported states: ${LIFECYCLE_STATES.join(', ')}`);
    }

    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) {
      throw new Error(`Asset '${assetId}' not found`);
    }

    if (asset.legal_hold_flag && ['PENDING_DISPOSITION', 'DISPOSED', 'DESTROYED'].includes(formattedState)) {
      throw new Error(`Lifecycle transition to '${formattedState}' blocked: Asset is under active Legal Hold`);
    }

    const updated = await client.vaultAsset.update({
      where: { id: asset.id },
      data: { lifecycle_state: formattedState },
    });

    await client.vaultRetentionEvent.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        event_type: 'LIFECYCLE_TRANSITION',
        summary: `Lifecycle state updated from '${asset.lifecycle_state}' to '${formattedState}'`,
        actor_id: actorId,
      },
    });

    return updated;
  }
}

module.exports = RecordsManagementService;
