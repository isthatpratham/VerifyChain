/**
 * PolicyAssignmentService.js
 * Automatic Rule-Based & Manual Policy Assignment Service for Enterprise Vault (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');
const RetentionPolicyEngine = require('./RetentionPolicyEngine');

class PolicyAssignmentService {
  /**
   * Assign a Retention Policy to a Vault Asset
   */
  static async assignPolicy({ assetId, policyId, assignedBy = 'SYSTEM', msmeId = 1 }, client = defaultPrisma) {
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

    const policy = await client.vaultRetentionPolicy.findFirst({
      where: {
        OR: [
          { policy_id: policyId },
          { id: isNaN(Number(policyId)) ? -1 : Number(policyId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!policy) {
      throw new Error(`Policy '${policyId}' not found`);
    }

    const assignment = await client.vaultPolicyAssignment.upsert({
      where: {
        policy_id_asset_id: {
          policy_id: policy.id,
          asset_id: asset.id,
        },
      },
      update: { assigned_by: assignedBy, assigned_at: new Date() },
      create: {
        policy_id: policy.id,
        asset_id: asset.id,
        assigned_by: assignedBy,
      },
    });

    // Calculate retention expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + policy.retention_days);

    await client.vaultAsset.update({
      where: { id: asset.id },
      data: {
        retention_expires_at: expirationDate,
        lifecycle_state: 'RETENTION_ACTIVE',
      },
    });

    // Log Retention Event
    await client.vaultRetentionEvent.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        event_type: 'POLICY_ASSIGNED',
        summary: `Policy '${policy.name}' assigned to asset '${asset.title}' (Expires: ${expirationDate.toISOString().split('T')[0]})`,
        actor_id: assignedBy,
        details: { policy_id: policy.policy_id, retention_days: policy.retention_days },
      },
    });

    return assignment;
  }

  /**
   * Auto-assign matching policies based on Category & Document Type
   */
  static async autoAssignPolicyForAsset(asset, msmeId = 1, client = defaultPrisma) {
    const policies = await RetentionPolicyEngine.listPolicies(msmeId, client);
    const matching = policies.find(p =>
      (p.document_type && p.document_type === asset.document_type) ||
      (p.category && p.category === asset.category)
    ) || policies.find(p => p.scope === 'GLOBAL');

    if (matching) {
      await this.assignPolicy({
        assetId: asset.asset_id,
        policyId: matching.policy_id,
        assignedBy: 'AUTO_RULE_ENGINE',
        msmeId,
      }, client);
    }
  }
}

module.exports = PolicyAssignmentService;
