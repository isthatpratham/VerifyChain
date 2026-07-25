/**
 * ActionPlanner.js
 * Remediation Action Plan Generator Engine.
 * Generates prioritized, step-by-step action plans to resolve gaps and improve trust standing.
 */

const defaultPrisma = require('../../utils/prismaClient');

class ActionPlanner {
  async generateActionPlans(msmeId = 1, gaps = []) {
    const plans = [
      {
        planCode: 'PLAN_STATUTORY_RENEWAL',
        title: 'Statutory Verification & Renewal Remediation',
        description: 'Complete GSTIN/PAN government portal verification and renew expiring statutory filings.',
        category: 'REMEDIATION',
        priority: gaps.some((g) => g.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
        estimatedImpact: 'HIGH',
        estimatedEffort: 'LOW',
        actionSteps: [
          { step: 1, action: 'Open Compliance Workspace and verify active GSTIN status.', owner: 'Compliance Officer' },
          { step: 2, action: 'Trigger GSTN Government Verification Portal connector adapter.', owner: 'System Automated' },
          { step: 3, action: 'Confirm filing reference and update statutory renewal registry.', owner: 'MSME Admin' },
        ],
        isCompleted: false,
      },
      {
        planCode: 'PLAN_ERP_CONNECTOR_SYNC',
        title: 'ERP Connector & Invoice Ledger Integration',
        description: 'Connect TallyPrime or SAP S/4HANA enterprise connector to automate verified invoice ledger sync.',
        category: 'INTEGRATION',
        priority: 'MEDIUM',
        estimatedImpact: 'HIGH',
        estimatedEffort: 'MEDIUM',
        actionSteps: [
          { step: 1, action: 'Navigate to Connectors catalog and select ERP Provider (SAP/QuickBooks/Tally).', owner: 'Developer Admin' },
          { step: 2, action: 'Provide encrypted API key or Bridge Token for AES-256 connection.', owner: 'DevOps Engineer' },
          { step: 3, action: 'Execute initial invoice ledger synchronization job.', owner: 'System Automated' },
        ],
        isCompleted: false,
      },
    ];

    for (const plan of plans) {
      await defaultPrisma.actionPlan.upsert({
        where: { plan_code: plan.planCode },
        update: {
          title: plan.title,
          description: plan.description,
          priority: plan.priority,
          estimated_impact: plan.estimatedImpact,
          estimated_effort: plan.estimatedEffort,
          action_steps_json: plan.actionSteps,
        },
        create: {
          msme_id: msmeId,
          plan_code: plan.planCode,
          title: plan.title,
          description: plan.description,
          category: plan.category,
          priority: plan.priority,
          estimated_impact: plan.estimatedImpact,
          estimated_effort: plan.estimatedEffort,
          action_steps_json: plan.actionSteps,
        },
      }).catch(() => {});
    }

    return plans;
  }
}

module.exports = new ActionPlanner();
