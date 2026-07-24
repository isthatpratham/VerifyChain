/**
 * MetricsCollector.js
 * Lightweight In-Process Metrics Collector for Observability.
 * Tracks request latency percentiles, error counters, webhook delivery queue depth,
 * and database query timings. Future-ready for Prometheus and OpenTelemetry export.
 */

class MetricsCollector {
  constructor() {
    this.counters = {};
    this.histograms = {};
    this.gauges = {};
    this.startTime = Date.now();
  }

  // ─── COUNTERS ───────────────────────────────────────────────────────────────

  /**
   * Increment a named counter
   */
  increment(name, labels = {}, value = 1) {
    const key = this._key(name, labels);
    this.counters[key] = (this.counters[key] || 0) + value;
  }

  /**
   * Get counter value
   */
  getCounter(name, labels = {}) {
    return this.counters[this._key(name, labels)] || 0;
  }

  // ─── HISTOGRAMS (LATENCY) ──────────────────────────────────────────────────

  /**
   * Record a latency observation (ms)
   */
  observe(name, durationMs, labels = {}) {
    const key = this._key(name, labels);
    if (!this.histograms[key]) {
      this.histograms[key] = [];
    }

    this.histograms[key].push(durationMs);

    // Keep last 10,000 observations to prevent unbounded memory growth
    if (this.histograms[key].length > 10000) {
      this.histograms[key] = this.histograms[key].slice(-5000);
    }
  }

  /**
   * Get percentile from histogram
   */
  getPercentile(name, percentile, labels = {}) {
    const key = this._key(name, labels);
    const values = this.histograms[key];
    if (!values || values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  /**
   * Get histogram summary (count, p50, p95, p99)
   */
  getSummary(name, labels = {}) {
    const key = this._key(name, labels);
    const values = this.histograms[key];
    if (!values || values.length === 0) {
      return { count: 0, p50: 0, p95: 0, p99: 0, avg: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);

    return {
      count: sorted.length,
      p50: sorted[Math.ceil(0.5 * sorted.length) - 1] || 0,
      p95: sorted[Math.ceil(0.95 * sorted.length) - 1] || 0,
      p99: sorted[Math.ceil(0.99 * sorted.length) - 1] || 0,
      avg: parseFloat((sum / sorted.length).toFixed(2)),
    };
  }

  // ─── GAUGES ─────────────────────────────────────────────────────────────────

  /**
   * Set a gauge value (e.g., queue depth, active connections)
   */
  setGauge(name, value, labels = {}) {
    this.gauges[this._key(name, labels)] = value;
  }

  /**
   * Get gauge value
   */
  getGauge(name, labels = {}) {
    return this.gauges[this._key(name, labels)] || 0;
  }

  // ─── SNAPSHOT ───────────────────────────────────────────────────────────────

  /**
   * Export full metrics snapshot for monitoring dashboards
   */
  snapshot() {
    return {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      counters: { ...this.counters },
      gauges: { ...this.gauges },
      histograms: Object.fromEntries(
        Object.entries(this.histograms).map(([key]) => [key, this.getSummary(key)])
      ),
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.counters = {};
    this.histograms = {};
    this.gauges = {};
  }

  // ─── INTERNAL ───────────────────────────────────────────────────────────────

  _key(name, labels = {}) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }
}

module.exports = new MetricsCollector();
