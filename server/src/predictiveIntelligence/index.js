/**
 * index.js (predictiveIntelligence)
 * Master Public API Interface for Phase 9.5 Predictive Intelligence & Forecasting Context.
 */

const predictiveIntelligenceFacade = require('./application/PredictiveIntelligenceFacade');
const forecastEngine = require('./engines/ForecastEngine');
const trendAnalyzer = require('./engines/TrendAnalyzer');
const anomalyDetector = require('./engines/AnomalyDetector');
const renewalPredictor = require('./engines/RenewalPredictor');
const trustPredictor = require('./engines/TrustPredictor');
const riskPredictor = require('./engines/RiskPredictor');
const scenarioSimulator = require('./engines/ScenarioSimulator');
const earlyWarningCenter = require('./engines/EarlyWarningCenter');

module.exports = {
  PredictiveIntelligence: predictiveIntelligenceFacade,
  ForecastEngine: forecastEngine,
  TrendAnalyzer: trendAnalyzer,
  AnomalyDetector: anomalyDetector,
  RenewalPredictor: renewalPredictor,
  TrustPredictor: trustPredictor,
  RiskPredictor: riskPredictor,
  ScenarioSimulator: scenarioSimulator,
  EarlyWarningCenter: earlyWarningCenter,
};
