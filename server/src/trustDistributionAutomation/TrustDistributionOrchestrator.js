/**
 * TrustDistributionOrchestrator.js
 * Centralized Trust Distribution Orchestrator coordinating lifecycle automation,
 * impact analysis, selective asset regeneration, cache invalidation, and telemetry tracking.
 */
const impactEngine = require('./TrustDistributionImpactEngine');
const domainEventBus = require('../events/DomainEventBus');
const trustDistributionService = require('../services/trustDistribution.service');

class TrustDistributionOrchestrator {
  constructor() {
    this.metrics = {
      workflowsTriggered: 0,
      assetsRegenerated: 0,
      totalFailures: 0,
      lastExecutionDurationMs: 0,
      activeCorrelationIds: new Set(),
    };

    // ── Lifecycle: Auto-initialize distribution identity when trust profile is first created ──
    domainEventBus.subscribe(domainEventBus.EVENTS.SUPPLIER_TRUST_PROFILE_CREATED, async (event) => {
      await this.handleDistributionInitialization('SupplierTrustProfileCreated', event);
    });

    // ── Lifecycle: Re-initialize / sync when trust level changes ──
    domainEventBus.subscribe(domainEventBus.EVENTS.TRUST_LEVEL_CHANGED, async (event) => {
      await this.handleDistributionEvent('TrustLevelChanged', event);
    });

    // ── Lifecycle: Initialize distribution on first approval ──
    domainEventBus.subscribe(domainEventBus.EVENTS.VERIFICATION_APPROVED, async (event) => {
      await this.handleDistributionInitialization('VerificationApproved', event);
    });

    domainEventBus.subscribe('QRCodeRevoked', async (event) => {
      await this.handleDistributionEvent('QRCodeRevoked', event);
    });
  }

  /**
   * Handle incoming distribution event and execute selective synchronization
   */
  async handleDistributionEvent(eventType, event = {}) {
    const startTime = Date.now();
    const correlationId = `WF_DIST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.metrics.workflowsTriggered++;
    this.metrics.activeCorrelationIds.add(correlationId);

    const { msmeId } = event.payload || {};
    if (!msmeId) return;

    try {
      console.log(`[TrustDistributionOrchestrator] Handling ${eventType} for MSME ${msmeId} (Correlation: ${correlationId})`);

      domainEventBus.publish('DistributionSynchronizationStarted', {
        msmeId,
        correlationId,
        eventType,
      });

      // 1. Impact Analysis
      const impact = impactEngine.analyzeImpact(eventType, event.payload);
      console.log(`[TrustDistributionOrchestrator] Impact Analysis: [${impact.affectedAssets.join(', ')}]`);

      // 2. Selective Asset Regeneration
      if (impact.requiresAssetRegeneration) {
        await trustDistributionService.generateTrustAssets(msmeId);
        this.metrics.assetsRegenerated++;
      }

      // 3. Cache Invalidation Notice
      domainEventBus.publish('DistributionCacheInvalidated', {
        msmeId,
        publicSlug: impact.publicSlug,
      });

      this.metrics.lastExecutionDurationMs = Date.now() - startTime;

      domainEventBus.publish('DistributionSynchronizationCompleted', {
        msmeId,
        correlationId,
        executionDurationMs: this.metrics.lastExecutionDurationMs,
      });

      console.log(`[TrustDistributionOrchestrator] Workflow ${correlationId} completed in ${this.metrics.lastExecutionDurationMs}ms`);
    } catch (err) {
      this.metrics.totalFailures++;
      console.error(`[TrustDistributionOrchestrator] Workflow ${correlationId} failed:`, err);
    } finally {
      this.metrics.activeCorrelationIds.delete(correlationId);
    }
  }

  /**
   * Handle initial distribution identity creation — called on SUPPLIER_TRUST_PROFILE_CREATED
   * and VERIFICATION_APPROVED events to auto-bootstrap the full distribution lifecycle.
   */
  async handleDistributionInitialization(eventType, event = {}) {
    const startTime = Date.now();
    const correlationId = `WF_DIST_INIT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.metrics.workflowsTriggered++;
    this.metrics.activeCorrelationIds.add(correlationId);

    const { msmeId } = event.payload || {};
    if (!msmeId) return;

    try {
      console.log(`[TrustDistributionOrchestrator] Initializing distribution for MSME ${msmeId} (Event: ${eventType}, Correlation: ${correlationId})`);

      // 1. Ensure distribution identity exists (idempotent — getOrCreate)
      const identity = await trustDistributionService.getOrCreateDistributionIdentity(msmeId);
      console.log(`[TrustDistributionOrchestrator] Distribution Identity ready: ${identity.stable_distribution_id}`);

      // 2. Auto-generate QR code on first initialization
      await trustDistributionService.generateQRCode(msmeId);
      this.metrics.assetsRegenerated++;

      this.metrics.lastExecutionDurationMs = Date.now() - startTime;
      console.log(`[TrustDistributionOrchestrator] Distribution initialized in ${this.metrics.lastExecutionDurationMs}ms for MSME ${msmeId}`);
    } catch (err) {
      this.metrics.totalFailures++;
      console.error(`[TrustDistributionOrchestrator] Distribution initialization ${correlationId} failed:`, err.message);
    } finally {
      this.metrics.activeCorrelationIds.delete(correlationId);
    }
  }

  /**
   * Manual distribution synchronization trigger — ensures identity + QR exist first
   */
  async synchronizeDistribution(msmeId) {
    await this.handleDistributionInitialization('ManualSync', { payload: { msmeId } });
    await this.handleDistributionEvent('TrustLevelChanged', { payload: { msmeId } });
    return {
      success: true,
      msmeId,
      synchronizedAt: new Date().toISOString(),
    };
  }

  /**
   * Get telemetry and metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeWorkflows: this.metrics.activeCorrelationIds.size,
    };
  }
}

module.exports = new TrustDistributionOrchestrator();
