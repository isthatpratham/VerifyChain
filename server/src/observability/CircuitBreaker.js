/**
 * CircuitBreaker.js
 * Circuit Breaker Pattern for Outbound Calls (Webhook Deliveries, Connector Adapters).
 * Prevents cascading failures by short-circuiting requests to unhealthy dependencies.
 *
 * States:
 *   CLOSED  — Normal operation. Failures increment counter.
 *   OPEN    — All requests fail-fast. After cooldown, transitions to HALF_OPEN.
 *   HALF_OPEN — A single probe request is allowed. Success → CLOSED, failure → OPEN.
 */

class CircuitBreaker {
  /**
   * @param {Object} options
   * @param {number} options.failureThreshold  — Consecutive failures before opening (default: 5)
   * @param {number} options.cooldownMs        — Ms to wait before transitioning to HALF_OPEN (default: 30000)
   * @param {number} options.successThreshold  — Consecutive successes in HALF_OPEN to close (default: 2)
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownMs = options.cooldownMs || 30000;
    this.successThreshold = options.successThreshold || 2;

    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.stats = { totalCalls: 0, totalSuccesses: 0, totalFailures: 0, totalShortCircuited: 0 };
  }

  /**
   * Execute a function through the circuit breaker.
   * @param {Function} fn — Async function to protect.
   * @returns {Promise<*>} — Resolved value or thrown error.
   */
  async execute(fn) {
    this.stats.totalCalls++;

    if (this.state === 'OPEN') {
      // Check if cooldown has elapsed
      if (Date.now() - this.lastFailureTime >= this.cooldownMs) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        this.stats.totalShortCircuited++;
        throw new Error('Circuit breaker is OPEN — request short-circuited.');
      }
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    this.stats.totalSuccesses++;
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  _onFailure() {
    this.stats.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.successCount = 0;
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Get circuit breaker status and statistics.
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      ...this.stats,
    };
  }

  /**
   * Force reset the circuit breaker to CLOSED.
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

module.exports = CircuitBreaker;
