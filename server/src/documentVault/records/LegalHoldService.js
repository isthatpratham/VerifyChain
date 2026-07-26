/**
 * LegalHoldService.js
 * Enterprise Legal Hold Management & Compliance Protection Service for Vault (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');

class LegalHoldService {
  /**
   * Create Legal Hold & Bind Target Assets
   */
  static async createLegalHold({ title, caseReference, reason, priority = 'HIGH', assetIds = [], assignedBy = 'SYSTEM', msmeId = 1 }, client = defaultPrisma) {
    const hold = await client.vaultLegalHold.create({
      data: {
        msme_id: msmeId,
        title,
        case_reference: caseReference,
        reason,
        priority: priority.toUpperCase(),
        assigned_by: assignedBy,
        status: 'ACTIVE',
      },
    });

    if (assetIds.length > 0) {
      for (const aId of assetIds) {
        const asset = await client.vaultAsset.findFirst({
          where: {
            OR: [
              { asset_id: aId },
              { id: isNaN(Number(aId)) ? -1 : Number(aId) },
            ],
            msme_id: msmeId,
          },
        });

        if (asset) {
          await client.vaultHoldAsset.create({
            data: { hold_id: hold.id, asset_id: asset.id },
          });

          await client.vaultAsset.update({
            where: { id: asset.id },
            data: { legal_hold_flag: true, lifecycle_state: 'LEGAL_HOLD' },
          });

          await client.vaultRetentionEvent.create({
            data: {
              msme_id: msmeId,
              asset_id: asset.id,
              event_type: 'HOLD_PLACED',
              summary: `Legal Hold '${title}' (Ref: ${caseReference}) placed on asset`,
              actor_id: assignedBy,
              details: { hold_id: hold.hold_id, caseReference },
            },
          });
        }
      }
    }

    return hold;
  }

  /**
   * Release Legal Hold
   */
  static async releaseLegalHold({ holdId, releasedBy = 'SYSTEM', notes, msmeId = 1 }, client = defaultPrisma) {
    const hold = await client.vaultLegalHold.findFirst({
      where: {
        OR: [
          { hold_id: holdId },
          { id: isNaN(Number(holdId)) ? -1 : Number(holdId) },
        ],
        msme_id: msmeId,
      },
      include: { hold_assets: true },
    });

    if (!hold) {
      throw new Error(`Legal Hold '${holdId}' not found`);
    }

    const updated = await client.vaultLegalHold.update({
      where: { id: hold.id },
      data: {
        status: 'RELEASED',
        released_at: new Date(),
        released_by: releasedBy,
        notes,
      },
    });

    // Clear hold flags for assets unless on another active hold
    for (const ha of hold.hold_assets) {
      const activeOtherHolds = await client.vaultHoldAsset.findMany({
        where: {
          asset_id: ha.asset_id,
          hold: { status: 'ACTIVE', id: { not: hold.id } },
        },
      });

      if (activeOtherHolds.length === 0) {
        await client.vaultAsset.update({
          where: { id: ha.asset_id },
          data: { legal_hold_flag: false, lifecycle_state: 'ACTIVE' },
        });
      }

      await client.vaultRetentionEvent.create({
        data: {
          msme_id: msmeId,
          asset_id: ha.asset_id,
          event_type: 'HOLD_RELEASED',
          summary: `Legal Hold '${hold.title}' released`,
          actor_id: releasedBy,
        },
      });
    }

    return updated;
  }

  /**
   * Validate if asset can be deleted or disposed (Enforces Legal Hold Block)
   */
  static async canDeleteOrDispose(assetId, msmeId = 1, client = defaultPrisma) {
    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) return { allowed: false, reason: 'Asset not found' };

    if (asset.legal_hold_flag) {
      return {
        allowed: false,
        reason: `Deletion/Disposition Blocked: Asset is currently under active Legal Hold`,
      };
    }

    return { allowed: true, reason: 'No active legal hold' };
  }

  /**
   * List Legal Holds
   */
  static async listLegalHolds(msmeId = 1, client = defaultPrisma) {
    return await client.vaultLegalHold.findMany({
      where: { msme_id: msmeId },
      include: { hold_assets: { include: { asset: true } } },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = LegalHoldService;
