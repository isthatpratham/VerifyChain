/**
 * PenaltyBonusEngine.js
 * Deterministic Penalty and Bonus evaluation engine.
 * Applies configurable deductions and bonuses defined in HealthScoreConfig.
 */

class PenaltyBonusEngine {
  evaluate(complianceRecords = [], config = {}) {
    const penaltyRules = config.penalty_rules || { overdue_deduction: 15, due_deduction: 5 };
    const bonusRules = config.bonus_rules || { perfect_compliance_bonus: 5 };

    let totalPenalties = 0;
    let totalBonuses = 0;
    const penaltyReasons = [];
    const bonusReasons = [];

    let hasOverdue = false;

    for (const rec of complianceRecords) {
      if (rec.status === 'OVERDUE') {
        hasOverdue = true;
        const deduction = penaltyRules.overdue_deduction || 15;
        totalPenalties += deduction;
        penaltyReasons.push(`Overdue statutory compliance for ${rec.authority} (-${deduction} pts).`);
      } else if (rec.status === 'DUE') {
        const deduction = penaltyRules.due_deduction || 5;
        totalPenalties += deduction;
        penaltyReasons.push(`Filing due soon for ${rec.authority} (-${deduction} pts).`);
      }
    }

    // Perfect Compliance Bonus check
    const nonExempt = complianceRecords.filter((r) => r.status !== 'EXEMPT');
    if (nonExempt.length > 0 && !hasOverdue && nonExempt.every((r) => r.status === 'COMPLIANT')) {
      const bonus = bonusRules.perfect_compliance_bonus || 5;
      totalBonuses += bonus;
      bonusReasons.push(`Perfect statutory compliance record across all active filings (+${bonus} pts).`);
    }

    return {
      totalPenalties,
      totalBonuses,
      penaltyReasons,
      bonusReasons,
    };
  }
}

module.exports = new PenaltyBonusEngine();
