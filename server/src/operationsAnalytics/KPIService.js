/**
 * KPIService.js
 * Configurable Operational KPI Widget Engine (Phase 11.5).
 */

const defaultPrisma = require('../utils/prismaClient');

const STANDARD_KPIS = [
  { code: 'KPI_PLATFORM_HEALTH', title: 'Platform Health Index', category: 'HEALTH', target: 100.0, current: 100.0, unit: 'PERCENTAGE', widgetType: 'GAUGE' },
  { code: 'KPI_DAU_MAU_RATIO', title: 'DAU / MAU Engagement Ratio', category: 'USERS', target: 50.0, current: 45.0, unit: 'PERCENTAGE', widgetType: 'CARD' },
  { code: 'KPI_COMPLIANCE_SCORE', title: 'Compliance Health Score Avg', category: 'COMPLIANCE', target: 95.0, current: 94.5, unit: 'PERCENTAGE', widgetType: 'CARD' },
  { code: 'KPI_TRUST_SCORE', title: 'Supplier Trust Rating Avg', category: 'TRUST', target: 95.0, current: 96.2, unit: 'PERCENTAGE', widgetType: 'CARD' },
  { code: 'KPI_STORAGE_USAGE', title: 'Vault Storage Consumption', category: 'STORAGE', target: 10000.0, current: 4850.0, unit: 'BYTES', widgetType: 'CARD' },
  { code: 'KPI_SECURITY_INCIDENTS', title: 'Open Security Incidents', category: 'SECURITY', target: 0.0, current: 0.0, unit: 'COUNT', widgetType: 'CARD' },
];

class KPIService {
  /**
   * Seed Standard KPI Configurations
   */
  static async seedKPIs(client = defaultPrisma) {
    const seeded = [];
    for (const k of STANDARD_KPIS) {
      const kpi = await client.opKPIConfiguration.upsert({
        where: { code: k.code },
        update: { title: k.title, current_value: k.current, target_value: k.target },
        create: {
          code: k.code,
          title: k.title,
          category: k.category,
          target_value: k.target,
          current_value: k.current,
          unit: k.unit,
          widget_type: k.widgetType,
        },
      });
      seeded.push(kpi);
    }
    return seeded;
  }

  /**
   * List KPI Configurations & Values
   */
  static async listKPIs(category = null, client = defaultPrisma) {
    await this.seedKPIs(client);

    const where = { is_active: true };
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    return await client.opKPIConfiguration.findMany({
      where,
      orderBy: { code: 'asc' },
    });
  }
}

module.exports = KPIService;
