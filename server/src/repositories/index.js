const userRepository = require('./user.repository');
const msmeProfileRepository = require('./msmeProfile.repository');
const complianceRecordRepository = require('./complianceRecord.repository');
const documentRepository = require('./document.repository');
const alertRepository = require('./alert.repository');
const governmentSchemeRepository = require('./governmentScheme.repository');
const schemeMatchRepository = require('./schemeMatch.repository');
const buyerViewLogRepository = require('./buyerViewLog.repository');

const integrationRepository = require('./integration.repository');
const integrationConfigRepository = require('./integrationConfig.repository');
const developerAppRepository = require('./developerApp.repository');
const apiKeyRepository = require('./apiKey.repository');
const webhookSubscriptionRepository = require('./webhookSubscription.repository');
const integrationAuditRepository = require('./integrationAudit.repository');

module.exports = {
  userRepository,
  msmeProfileRepository,
  complianceRecordRepository,
  documentRepository,
  alertRepository,
  governmentSchemeRepository,
  schemeMatchRepository,
  buyerViewLogRepository,

  integrationRepository,
  integrationConfigRepository,
  developerAppRepository,
  apiKeyRepository,
  webhookSubscriptionRepository,
  integrationAuditRepository,
};
