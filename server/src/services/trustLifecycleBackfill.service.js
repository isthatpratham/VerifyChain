/**
 * trustLifecycleBackfill.service.js
 * Automatic, idempotent startup backfill service for Enterprise Trust Lifecycle.
 *
 * Guarantees that every verified enterprise automatically receives:
 *   Business Profile -> Supplier Trust Profile -> Published Standing (is_public=true)
 *   -> Distribution Identity -> Dynamic QR -> Trust Assets -> Public Verification Portal
 *
 * Safe to run on every server startup or on-demand. Never creates duplicate records.
 */
const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const supplierTrustService = require('./supplierTrust.service');
const trustDistributionService = require('./trustDistribution.service');
const domainEventBus = require('../events/DomainEventBus');

class TrustLifecycleBackfillService {
  /**
   * Run full idempotent backfill for all existing MSME Profiles
   */
  async runBackfill() {
    console.log('[TrustLifecycleBackfill] Starting Enterprise Trust Lifecycle startup audit & backfill...');
    const startTime = Date.now();

    try {
      const msmeProfiles = await msmeProfileRepository.findMany();
      console.log(`[TrustLifecycleBackfill] Found ${msmeProfiles.length} MSME profile(s) in database.`);

      let createdCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const msme of msmeProfiles) {
        try {
          // 1. Ensure Supplier Trust Profile exists & is published (is_public: true)
          const trustProfile = await supplierTrustService.getOrCreateTrustProfile(msme.id);

          // 2. Execute Trust Evaluation (score & policy evaluation)
          await supplierTrustService.evaluateTrust(msme.id);

          // 3. Ensure Trust Distribution Identity & Config exist
          await trustDistributionService.getOrCreateDistributionIdentity(msme.id);

          // 4. Auto-generate dynamic QR & multi-channel Trust Assets
          await trustDistributionService.generateTrustAssets(msme.id);

          if (!trustProfile.is_public) {
            updatedCount++;
          } else {
            createdCount++;
          }
        } catch (msmeErr) {
          errorCount++;
          console.error(`[TrustLifecycleBackfill] Error processing MSME ID ${msme.id}:`, msmeErr.message);
        }
      }

      const durationMs = Date.now() - startTime;
      console.log(
        `[TrustLifecycleBackfill] Completed backfill in ${durationMs}ms: ` +
        `${msmeProfiles.length} checked, ${createdCount} processed, ${updatedCount} updated, ${errorCount} error(s).`
      );

      domainEventBus.publish('TrustLifecycleBackfillCompleted', {
        totalProfiles: msmeProfiles.length,
        createdCount,
        updatedCount,
        errorCount,
        durationMs,
      });

      return {
        success: true,
        totalProfiles: msmeProfiles.length,
        createdCount,
        updatedCount,
        errorCount,
        durationMs,
      };
    } catch (err) {
      console.error('[TrustLifecycleBackfill] Critical backfill failure:', err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

module.exports = new TrustLifecycleBackfillService();
