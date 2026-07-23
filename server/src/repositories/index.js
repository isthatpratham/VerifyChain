const userRepository = require('./user.repository');
const msmeProfileRepository = require('./msmeProfile.repository');
const complianceRecordRepository = require('./complianceRecord.repository');
const documentRepository = require('./document.repository');
const alertRepository = require('./alert.repository');
const governmentSchemeRepository = require('./governmentScheme.repository');
const schemeMatchRepository = require('./schemeMatch.repository');
const buyerViewLogRepository = require('./buyerViewLog.repository');

module.exports = {
  userRepository,
  msmeProfileRepository,
  complianceRecordRepository,
  documentRepository,
  alertRepository,
  governmentSchemeRepository,
  schemeMatchRepository,
  buyerViewLogRepository,
};
