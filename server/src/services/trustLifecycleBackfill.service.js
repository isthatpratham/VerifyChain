/**
 * trustLifecycleBackfill.service.js
 * Automatic, idempotent startup and administrative backfill service for Enterprise Trust Lifecycle.
 *
 * Guarantees that every verified enterprise automatically receives:
 *   Business Profile -> Supplier Trust Profile -> Published Standing (is_public=true)
 *   -> Distribution Identity -> Dynamic QR -> Trust Assets -> Public Verification Portal
 *
 * Protected with distributed concurrency locking and duplicate prevention.
 * Never creates duplicate timeline events, tokens, or records on repeat executions.
 */
const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const supplierTrustService = require('./supplierTrust.service');
const trustDistributionService = require('./trustDistribution.service');
const domainEventBus = require('../events/DomainEventBus');
const prisma = require('../utils/prismaClient');

const BACKFILL_ADVISORY_LOCK_ID = 8847291;

class TrustLifecycleBackfillService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Run full idempotent backfill for all existing MSME Profiles
   */
  async runBackfill() {
    if (this.isRunning) {
      console.warn('[TrustLifecycleBackfill] Backfill operation is already running in this process.');
      return {
        success: false,
        error: 'Backfill operation is already in progress in this instance',
        inProgress: true,
      };
    }

    this.isRunning = true;
    let hasDbLock = false;

    console.log('[TrustLifecycleBackfill] Starting Enterprise Trust Lifecycle audit & backfill...');
    const startTime = Date.now();

    try {
      // Concurrency guard: Attempt to acquire distributed PostgreSQL advisory lock
      try {
        const lockResult = await prisma.$queryRaw`SELECT pg_try_advisory_lock(${BACKFILL_ADVISORY_LOCK_ID}) AS locked`;
        hasDbLock = lockResult?.[0]?.locked === true;
        if (!hasDbLock) {
          console.warn('[TrustLifecycleBackfill] Another process holds the backfill advisory lock.');
          return {
            success: false,
            error: 'Backfill is currently in progress by another worker or process',
            inProgress: true,
          };
        }
      } catch (lockErr) {
        // Fallback for non-Postgres environments (e.g. test environments without pg advisory lock support)
        console.warn('[TrustLifecycleBackfill] Advisory lock check unavailable, relying on in-process lock:', lockErr.message);
      }

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
          const distIdentity = await trustDistributionService.getOrCreateDistributionIdentity(msme.id);

          // 4. Ensure Dynamic QR verification asset exists without creating duplicate tokens or duplicate timeline events
          const existingQrEvents = await prisma.trustDistributionTimelineEvent.findMany({
            where: {
              trust_distribution_identity_id: distIdentity.id,
              event_type: 'QR_GENERATED',
            },
            take: 1,
          });

          if (existingQrEvents.length === 0) {
            await trustDistributionService.generateQRCode(msme.id);
          }

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
    } finally {
      if (hasDbLock) {
        try {
          await prisma.$queryRaw`SELECT pg_advisory_unlock(${BACKFILL_ADVISORY_LOCK_ID})`;
        } catch (unlockErr) {
          console.error('[TrustLifecycleBackfill] Error releasing advisory lock:', unlockErr.message);
        }
      }
      this.isRunning = false;
    }
  }
}

module.exports = new TrustLifecycleBackfillService();
