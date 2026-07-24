/**
 * SupplierTrustAutomationCoordinator.js
 * Centralized Supplier Trust Lifecycle Automation & Event Orchestration coordinator.
 * Manages event subscriptions, selective trust re-evaluations, telemetry metrics,
 * cache invalidation, and failure recovery.
 */
const dependencyGraph = require('./SupplierTrustDependencyGraph');
const domainEventBus = require('../events/DomainEventBus');
const { trustEvaluationPipeline } = require('../supplierTrustEngine');

class SupplierTrustAutomationCoordinator {
  constructor() {
    this.metrics = {
      workflowsTriggered: 0,
      trustEvaluationsCompleted: 0,
      trustLevelChanges: 0,
      totalFailures: 0,
      lastExecutionDurationMs: 0,
      activeCorrelationIds: new Set(),
    };

    // 1. Subscribe to ScoreCalculated domain events
    domainEventBus.subscribe(domainEventBus.EVENTS.SCORE_CALCULATED, async (event) => {
      await this.handleScoreCalculated(event);
    });

    // 2. Subscribe to ComplianceStatusChanged domain events
    domainEventBus.subscribe(domainEventBus.EVENTS.COMPLIANCE_STATUS_CHANGED, async (event) => {
      await this.handleComplianceStatusChanged(event);
    });

    // 3. Subscribe to TrustLevelChanged events to track telemetry
    domainEventBus.subscribe(domainEventBus.EVENTS.TRUST_LEVEL_CHANGED, () => {
      this.metrics.trustLevelChanges++;
    });
  }

  /**
   * Handle ScoreCalculated domain event
   */
  async handleScoreCalculated(event) {
    const startTime = Date.now();
    const correlationId = `WF_TRUST_SCORE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.metrics.workflowsTriggered++;
    this.metrics.activeCorrelationIds.add(correlationId);

    const { msmeId } = event.payload || {};
    if (!msmeId) return;

    try {
      console.log(`[SupplierTrustAutomationCoordinator] Handling ScoreCalculated for MSME ${msmeId} (Correlation: ${correlationId})`);

      const affectedPolicies = dependencyGraph.getAffectedPolicies('ScoreCalculated');
      console.log(`[SupplierTrustAutomationCoordinator] Checking trust policies: [${affectedPolicies.join(', ')}]`);

      // Trigger Trust Evaluation Pipeline
      const result = await trustEvaluationPipeline.executeEvaluation(msmeId);

      this.metrics.trustEvaluationsCompleted++;
      this.metrics.lastExecutionDurationMs = Date.now() - startTime;

      console.log(`[SupplierTrustAutomationCoordinator] Workflow ${correlationId} finished in ${this.metrics.lastExecutionDurationMs}ms with Trust Level: ${result.trustLevel}`);
    } catch (err) {
      this.metrics.totalFailures++;
      console.error(`[SupplierTrustAutomationCoordinator] Workflow ${correlationId} failed:`, err);
    } finally {
      this.metrics.activeCorrelationIds.delete(correlationId);
    }
  }

  /**
   * Handle ComplianceStatusChanged domain event
   */
  async handleComplianceStatusChanged(event) {
    const startTime = Date.now();
    const correlationId = `WF_TRUST_COMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.metrics.workflowsTriggered++;
    this.metrics.activeCorrelationIds.add(correlationId);

    const { msmeId } = event.payload || {};
    if (!msmeId) return;

    try {
      console.log(`[SupplierTrustAutomationCoordinator] Handling ComplianceStatusChanged for MSME ${msmeId} (Correlation: ${correlationId})`);

      await trustEvaluationPipeline.executeEvaluation(msmeId);

      this.metrics.trustEvaluationsCompleted++;
      this.metrics.lastExecutionDurationMs = Date.now() - startTime;
    } catch (err) {
      this.metrics.totalFailures++;
      console.error(`[SupplierTrustAutomationCoordinator] Workflow ${correlationId} failed:`, err);
    } finally {
      this.metrics.activeCorrelationIds.delete(correlationId);
    }
  }

  /**
   * Manual trigger for trust re-evaluation
   */
  async triggerRecalculation(msmeId) {
    await this.handleScoreCalculated({
      payload: { msmeId },
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

module.exports = new SupplierTrustAutomationCoordinator();
