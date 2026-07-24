const eligibilityValidator = require('./EligibilityValidator');
const categoryEvaluator = require('./CategoryEvaluator');
const penaltyBonusEngine = require('./PenaltyBonusEngine');
const scoreAggregator = require('./ScoreAggregator');
const scorePipeline = require('./ScorePipeline');

module.exports = {
  eligibilityValidator,
  categoryEvaluator,
  penaltyBonusEngine,
  scoreAggregator,
  scorePipeline,
};
