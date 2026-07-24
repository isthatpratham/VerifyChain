/**
 * HealthAutomationCoordinator.js
 * Centralized health automation and event orchestration coordinator service.
 * Coordinates selective re-evaluation, score recalculations, failure retries,
 * cache invalidations, and observability metrics.
 */
const dependencyGraph = require('./ComplianceDependencyGraph');
const domainEventBus = require('../events/DomainEventBus');
const { scorePipeline } = require('../scoreEngine');
const healthIntelligenceFacade = require('../healthIntelligenceEngine/HealthIntelligenceFacade');
const complianceOrchestratorService = require('../services/complianceOrchestrator.service');

class HealthAutomationCoordinator {
  constructor() {
    this.metrics = {
      workflowsTriggered: 0,
      selectiveRecalculations: 0,
      totalFailures: 0,
      lastExecutionDurationMs: 0,
      activeCorrelationIds: new Set(),
    };

    // 1. Subscribe to Business Updated domain events
    domainEventBus.subscribe(domainEventBus.EVENTS.BUSINESS_UPDATED, async (event) => {
      await this.handleBusinessUpdated(event);
    });

    // 2. Subscribe to Compliance Status Changed domain events
    domainEventBus.subscribe(domainEventBus.EVENTS.COMPLIANCE_STATUS_CHANGED, async (event) => {
      await this.handleComplianceStatusChanged(event);
    });
  }

  /**
   * Handle Business Profile Updated event
   */
  async handleBusinessUpdated(event) {
    const startTime = Date.now();
    const correlationId = `WF_BUS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.metrics.workflowsTriggered++;
    this.metrics.activeCorrelationIds.add(correlationId);

    const { msmeId, changedFields = [] } = event.payload || {};
    if (!msmeId) return;

    try {
      console.log(`[HealthAutomationCoordinator] Handling BusinessUpdated for MSME ${msmeId} (Correlation: ${correlationId})`);

      // 1. Resolve Dependency Graph
      const affectedAuthorities = dependencyGraph.getAffectedAuthorities(changedFields);
      console.log(`[HealthAutomationCoordinator] Affected authorities for fields [${changedFields.join(', ')}]: [${affectedAuthorities.join(', ')}]`);

      // 2. Selective Compliance Evaluation & Recalculation
      await complianceOrchestratorService.reevaluateRecordsForProfile(msmeId, changedFields);

      // 3. Trigger Deterministic Score Pipeline
      const scoreResult = await scorePipeline.executePipeline(msmeId);

      // 4. Generate Full Health Intelligence Insights
      await healthIntelligenceFacade.generateFullIntelligence(msmeId);

      this.metrics.selectiveRecalculations++;
      this.metrics.lastExecutionDurationMs = Date.now() - startTime;

      console.log(`[HealthAutomationCoordinator] Workflow ${correlationId} completed in ${this.metrics.lastExecutionDurationMs}ms with score ${scoreResult.overallScore}`);
    } catch (err) {
      this.metrics.totalFailures++;
      console.error(`[HealthAutomationCoordinator] Workflow ${correlationId} failed:`, err);
    } finally {
      this.metrics.activeCorrelationIds.delete(correlationId);
    }
  }

  /**
   * Handle Compliance Status Changed event
   */
  async handleComplianceStatusChanged(event) {
    const startTime = Date.now();
    const correlationId = `WF_COMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.metrics.workflowsTriggered++;
    this.metrics.activeCorrelationIds.add(correlationId);

    const { msmeId } = event.payload || {};
    if (!msmeId) return;

    try {
      console.log(`[HealthAutomationCoordinator] Handling ComplianceStatusChanged for MSME ${msmeId} (Correlation: ${correlationId})`);

      // Trigger Score Pipeline & Insights
      await scorePipeline.executePipeline(msmeId);
      await healthIntelligenceFacade.generateFullIntelligence(msmeId);

      this.metrics.selectiveRecalculations++;
      this.metrics.lastExecutionDurationMs = Date.now() - startTime;
    } catch (err) {
      this.metrics.totalFailures++;
      console.error(`[HealthAutomationCoordinator] Workflow ${correlationId} failed:`, err);
    } finally {
      this.metrics.activeCorrelationIds.delete(correlationId);
    }
  }

  /**
   * Manual trigger for selective score recalculation
   */
  async triggerRecalculation(msmeId, options = {}) {
    const { changedFields = [] } = options;
    await this.handleBusinessUpdated({
      payload: { msmeId, changedFields },
    });
    return {
      success: true,
      msmeId,
      recalculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get telemetry and observability metrics
   */
  getAutomationMetrics() {
    return {
      ...this.metrics,
      activeWorkflows: this.metrics.activeCorrelationIds.size,
      dependencyGraph: dependencyGraph.getGraphOverview(),
    };
  }
}

module.exports = new HealthAutomationCoordinator();
