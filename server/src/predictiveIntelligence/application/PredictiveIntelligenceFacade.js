/**
 * PredictiveIntelligenceFacade.js
 * Master Application Facade for Phase 9.5 Predictive Intelligence & Forecasting.
 */

const forecastEngine = require('../engines/ForecastEngine');
const trendAnalyzer = require('../engines/TrendAnalyzer');
const anomalyDetector = require('../engines/AnomalyDetector');
const renewalPredictor = require('../engines/RenewalPredictor');
const trustPredictor = require('../engines/TrustPredictor');
const riskPredictor = require('../engines/RiskPredictor');
const scenarioSimulator = require('../engines/ScenarioSimulator');
const earlyWarningCenter = require('../engines/EarlyWarningCenter');
const defaultPrisma = require('../../utils/prismaClient');

class PredictiveIntelligenceFacade {
  async getForecast(msmeId = 1) {
    return forecastEngine.generateFullForecast(msmeId);
  }

  async getTrends(msmeId = 1, metricName = 'TRUST_SCORE') {
    return trendAnalyzer.analyzeTrend(msmeId, metricName);
  }

  async getAnomalies(msmeId = 1) {
    return anomalyDetector.detectAnomalies(msmeId);
  }

  async getEarlyWarnings(msmeId = 1) {
    return earlyWarningCenter.getEarlyWarnings(msmeId);
  }

  async runScenarioSimulation({ scenarioType, params, msmeId = 1 }) {
    const result = scenarioSimulator.runSimulation({ scenarioType, params, msmeId });

    // Persist scenario to DB
    const dbSim = await defaultPrisma.scenarioSimulation.create({
      data: {
        msme_id: parseInt(msmeId, 10) || 1,
        simulation_id: result.simulationId,
        title: result.title,
        scenario_type: scenarioType || 'GST_DELAY',
        parameters_json: params || {},
      },
    }).catch(() => null);

    if (dbSim) {
      await defaultPrisma.scenarioResult.create({
        data: {
          simulation_id: dbSim.id,
          trust_impact: result.simulatedResults.trustImpact,
          risk_impact: result.simulatedResults.riskImpact,
          business_impact: result.simulatedResults.businessImpact,
          recommendations_json: result.simulatedResults.recommendations,
        },
      }).catch(() => null);
    }

    return result;
  }

  async submitFeedback({ msmeId = 1, predictionId, isAccurate = true, notes = '' }) {
    return defaultPrisma.predictionFeedback.create({
      data: {
        msme_id: parseInt(msmeId, 10) || 1,
        prediction_id: predictionId || `PRED_${Date.now()}`,
        is_accurate: isAccurate,
        notes,
      },
    });
  }
}

module.exports = new PredictiveIntelligenceFacade();
