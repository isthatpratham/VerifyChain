/**
 * RecommendationEngine.js
 * Deterministic recommendation engine generating prioritized, actionable recommendations
 * based strictly on statutory compliance records and score deductions.
 */

class RecommendationEngine {
  generateRecommendations(complianceRecords = [], scoreBreakdown = {}) {
    const recommendations = [];

    for (const rec of complianceRecords) {
      if (rec.status === 'OVERDUE') {
        recommendations.push({
          id: `REC_URGENT_${rec.authority}`,
          title: `Resolve Overdue ${rec.authority} Statutory Filing`,
          description: `Your ${rec.authority} filing is currently overdue. Immediate action is required to avoid penalty deductions and restore compliance score.`,
          authority: rec.authority,
          priority: 'CRITICAL',
          estimatedScoreImpact: '+15 pts',
          reason: `Statutory record ${rec.authority} is in OVERDUE status.`,
          actionType: 'RESOLVE_FILING',
        });
      } else if (rec.status === 'DUE') {
        recommendations.push({
          id: `REC_DUE_${rec.authority}`,
          title: `File Upcoming ${rec.authority} Return`,
          description: `Your ${rec.authority} filing is due soon. Complete submission before the expiry date to prevent penalty deductions.`,
          authority: rec.authority,
          priority: 'HIGH',
          estimatedScoreImpact: '+5 pts',
          reason: `Statutory record ${rec.authority} is approaching filing deadline.`,
          actionType: 'FILE_RETURN',
        });
      }
    }

    // Additional category-based recommendations
    const breakdown = scoreBreakdown.categoryBreakdown || {};
    for (const [code, cat] of Object.entries(breakdown)) {
      if (cat.score < 70) {
        recommendations.push({
          id: `REC_CAT_${code}`,
          title: `Improve ${code} Domain Compliance Health`,
          description: `Category ${code} score is currently ${cat.score}/100. Address overdue and pending items in this category.`,
          authority: code,
          priority: 'MEDIUM',
          estimatedScoreImpact: '+10 pts',
          reason: `Category ${code} score is below 70 points.`,
          actionType: 'CATEGORY_IMPROVEMENT',
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityMap = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }
}

module.exports = new RecommendationEngine();
