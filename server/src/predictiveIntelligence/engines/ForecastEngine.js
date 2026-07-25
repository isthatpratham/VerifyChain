/**
 * ForecastEngine.js
 * Core Synthesis & Prediction Forecasting Engine.
 */

const trendAnalyzer = require('./TrendAnalyzer');
const trustPredictor = require('./TrustPredictor');
const riskPredictor = require('./RiskPredictor');
const renewalPredictor = require('./RenewalPredictor');

class ForecastEngine {
  async generateFullForecast(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;

    const trend = await trendAnalyzer.analyzeTrend(parsedId, 'TRUST_SCORE');
    const trust = trustPredictor.predictTrustScore({ currentTrust: 95.0, slope: trend.slopeValue });
    const risk = riskPredictor.predictRiskTrajectory(parsedId);
    const renewals = await renewalPredictor.predictRenewals(parsedId);

    return {
      msmeId: parsedId,
      forecastId: `FCST_${parsedId}_${Date.now()}`,
      trend,
      trustForecast: trust,
      riskForecast: risk,
      renewalForecasts: renewals,
      overallConfidenceScore: 0.95,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new ForecastEngine();
