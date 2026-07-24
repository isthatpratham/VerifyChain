/**
 * StrengthWeaknessEngine.js
 * Deterministic strength and weakness analysis engine.
 */

class StrengthWeaknessEngine {
  analyze(complianceRecords = [], categoryBreakdown = {}) {
    const strengths = [];
    const weaknesses = [];

    const overdueRecords = complianceRecords.filter((r) => r.status === 'OVERDUE');
    const dueRecords = complianceRecords.filter((r) => r.status === 'DUE');


    if (overdueRecords.length === 0) {
      strengths.push({
        code: 'NO_OVERDUE',
        title: 'Zero Overdue Filings',
        description: 'All statutory filings are up to date with zero overdue items.',
      });
    } else {
      weaknesses.push({
        code: 'HAS_OVERDUE',
        title: `${overdueRecords.length} Overdue Statutory Filing(s)`,
        description: `Overdue status detected for: ${overdueRecords.map((r) => r.authority).join(', ')}.`,
      });
    }

    if (dueRecords.length > 0) {
      weaknesses.push({
        code: 'UPCOMING_DUE',
        title: `${dueRecords.length} Upcoming Filing Deadline(s)`,
        description: `Filings approaching deadline for: ${dueRecords.map((r) => r.authority).join(', ')}.`,
      });
    }

    // Category Level Strengths / Weaknesses
    for (const [code, cat] of Object.entries(categoryBreakdown)) {
      if (cat.score === 100) {
        strengths.push({
          code: `STRONG_CAT_${code}`,
          title: `Flawless ${code} Category Health`,
          description: `Category ${code} has achieved 100/100 compliance health score.`,
        });
      } else if (cat.score < 70) {
        weaknesses.push({
          code: `WEAK_CAT_${code}`,
          title: `Low ${code} Category Health (${cat.score}/100)`,
          description: `Category ${code} requires attention due to pending or overdue items.`,
        });
      }
    }

    return {
      strengths,
      weaknesses,
    };
  }
}

module.exports = new StrengthWeaknessEngine();
