/**
 * IntegrationLogger.js
 * Observability, structured logging, correlation tracking, performance tracing,
 * and telemetry hooks for Enterprise Integration Platform.
 */
const crypto = require('crypto');

class IntegrationLogger {
  constructor() {
    this.metrics = {
      eventsLogged: 0,
      executionsTraced: 0,
      totalExecutionTimeMs: 0,
      errorCount: 0,
    };
  }

  /**
   * Generate a unique correlation ID for distributed request tracing
   */
  createCorrelationId() {
    return `corr_int_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Log a structured integration telemetry event
   */
  logEvent(level, message, context = {}) {
    this.metrics.eventsLogged++;
    const timestamp = new Date().toISOString();
    const correlationId = context.correlationId || this.createCorrelationId();

    const structuredLog = {
      timestamp,
      level: level.toUpperCase(),
      message,
      correlationId,
      ...context,
    };

    if (level.toUpperCase() === 'ERROR') {
      this.metrics.errorCount++;
      console.error(`[IntegrationPlatform:${level.toUpperCase()}]`, JSON.stringify(structuredLog));
    } else {
      console.log(`[IntegrationPlatform:${level.toUpperCase()}]`, JSON.stringify(structuredLog));
    }

    return structuredLog;
  }

  /**
   * Trace execution time of an integration function
   */
  async traceExecution(actionName, fn, context = {}) {
    const startTime = Date.now();
    const correlationId = context.correlationId || this.createCorrelationId();

    try {
      const result = await fn();
      const executionTimeMs = Date.now() - startTime;

      this.metrics.executionsTraced++;
      this.metrics.totalExecutionTimeMs += executionTimeMs;

      this.logEvent('INFO', `Execution completed for '${actionName}'`, {
        ...context,
        correlationId,
        executionTimeMs,
        success: true,
      });

      return result;
    } catch (err) {
      const executionTimeMs = Date.now() - startTime;
      this.logEvent('ERROR', `Execution failed for '${actionName}': ${err.message}`, {
        ...context,
        correlationId,
        executionTimeMs,
        success: false,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Return health and telemetry metrics for observability
   */
  getHealthCheckStatus() {
    const avgTimeMs = this.metrics.executionsTraced > 0
      ? (this.metrics.totalExecutionTimeMs / this.metrics.executionsTraced).toFixed(2)
      : 0;

    return {
      status: this.metrics.errorCount > 10 ? 'DEGRADED' : 'HEALTHY',
      platformVersion: '1.0.0',
      metrics: {
        ...this.metrics,
        avgExecutionTimeMs: parseFloat(avgTimeMs),
      },
      checkedAt: new Date().toISOString(),
    };
  }
}

module.exports = new IntegrationLogger();
