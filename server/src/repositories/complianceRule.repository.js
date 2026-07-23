const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class ComplianceRuleRepository extends BaseRepository {
  constructor() {
    super('complianceRule');
  }

  /**
   * Fetch all active rules
   */
  async findActiveRules(client = defaultPrisma) {
    return this.findMany(
      {
        where: { status: 'ACTIVE' },
        orderBy: [{ priority: 'desc' }, { authority: 'asc' }],
      },
      client
    );
  }

  /**
   * Find by custom string rule_id (e.g., 'RULE_GST_01')
   */
  async findByRuleId(ruleId, client = defaultPrisma) {
    return this.findUnique({ rule_id: ruleId }, {}, client);
  }

  /**
   * Record evaluation log for auditing
   */
  async createAuditLog(logData, client = defaultPrisma) {
    return client.ruleEvaluationLog.create({
      data: logData,
    });
  }

  /**
   * Get evaluation logs for an MSME
   */
  async getAuditLogs(msmeId, options = {}, client = defaultPrisma) {
    const { skip = 0, take = 10 } = options;
    const [items, total] = await Promise.all([
      client.ruleEvaluationLog.findMany({
        where: { msme_id: msmeId },
        include: { compliance_rule: true },
        orderBy: { evaluated_at: 'desc' },
        skip,
        take,
      }),
      client.ruleEvaluationLog.count({ where: { msme_id: msmeId } }),
    ]);

    return { items, total };
  }
}

module.exports = new ComplianceRuleRepository();
