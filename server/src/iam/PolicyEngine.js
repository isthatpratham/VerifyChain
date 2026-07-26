/**
 * PolicyEngine.js
 * Policy Abstraction & Reusable Authorization Rule Engine (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');

class PolicyEngine {
  /**
   * Evaluate Policy Rules on Context ({ user, permission, resource, msmeId })
   */
  static async evaluatePolicies(context, client = defaultPrisma) {
    const { user, permission, resource } = context;

    // 1. Rule: Platform Admin Bypass
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return { allowed: true, policyName: 'PLATFORM_ADMIN_BYPASS', reason: 'Platform administrators bypass organization boundaries' };
    }

    // 2. Rule: Owner-Only Operations (Delete)
    if (permission.endsWith('.delete')) {
      if (resource && resource.owner_id && Number(resource.owner_id) === Number(user.id)) {
        return { allowed: true, policyName: 'OWNER_ONLY_DELETE', reason: 'Resource owner granted delete access' };
      }
      return { allowed: false, policyName: 'OWNER_ONLY_DELETE', reason: 'Only the resource owner or admin may delete resources' };
    }

    // 3. Rule: Compliance Manager Approvals
    if (permission === 'compliance.execute') {
      if (user.role === 'COMPLIANCE_OFFICER' || user.role === 'COMPLIANCE_MANAGER' || user.role === 'MSME_OWNER') {
        return { allowed: true, policyName: 'COMPLIANCE_OFFICER_EXECUTE', reason: 'Compliance execution role authorized' };
      }
    }

    return { allowed: true, policyName: 'DEFAULT_POLICY_PASS', reason: 'Standard policy evaluation passed' };
  }

  /**
   * Seed Standard Authorization Policies
   */
  static async seedPolicies(client = defaultPrisma) {
    const defaultPolicies = [
      { code: 'PLATFORM_ADMIN_BYPASS', name: 'Platform Admin Bypass Policy', rule_type: 'PLATFORM_ADMIN_BYPASS', description: 'Platform admins bypass organization scope restrictions' },
      { code: 'OWNER_ONLY_DELETE', name: 'Owner-Only Deletion Policy', rule_type: 'OWNER_ONLY', description: 'Only owner or admin may delete records' },
      { code: 'COMPLIANCE_MANAGER_ONLY', name: 'Compliance Manager Approval Policy', rule_type: 'COMPLIANCE_MANAGER_ONLY', description: 'Only compliance managers may approve assessments' },
    ];

    for (const pol of defaultPolicies) {
      await client.authorizationPolicy.upsert({
        where: { code: pol.code },
        update: { name: pol.name, description: pol.description },
        create: pol,
      });
    }
  }
}

module.exports = PolicyEngine;
