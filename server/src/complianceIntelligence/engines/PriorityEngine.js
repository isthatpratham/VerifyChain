/**
 * PriorityEngine.js
 * Priority Assessment & Ranking Engine.
 * Ranks recommendations and gaps by compliance severity, business impact, expiry timeline, and dependencies.
 */

class PriorityEngine {
  /**
   * Determine priority level for an item
   * @returns {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL'}
   */
  calculatePriority({ severity = 'MEDIUM', businessImpact = 'MEDIUM', daysToExpiry = 90 }) {
    if (daysToExpiry <= 7 || severity === 'CRITICAL') {
      return 'CRITICAL';
    }
    if (daysToExpiry <= 30 || severity === 'HIGH' || businessImpact === 'HIGH') {
      return 'HIGH';
    }
    if (severity === 'MEDIUM' || businessImpact === 'MEDIUM') {
      return 'MEDIUM';
    }
    if (severity === 'LOW') {
      return 'LOW';
    }
    return 'INFORMATIONAL';
  }

  /**
   * Sort array of items by priority rank
   */
  sortItemsByPriority(items = []) {
    const rankMap = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4, INFORMATIONAL: 5 };
    return [...items].sort((a, b) => {
      const rankA = rankMap[a.priority] || 3;
      const rankB = rankMap[b.priority] || 3;
      return rankA - rankB;
    });
  }
}

module.exports = new PriorityEngine();
