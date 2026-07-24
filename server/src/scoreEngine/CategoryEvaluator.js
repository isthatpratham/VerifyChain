/**
 * CategoryEvaluator.js
 * Evaluates individual statutory compliance records grouped into scoring categories:
 * TAX, LABOUR, CORPORATE, LICENSING.
 */

class CategoryEvaluator {
  constructor() {
    this.AUTHORITY_CATEGORY_MAP = {
      GST: 'TAX',
      EPFO: 'LABOUR',
      ESIC: 'LABOUR',
      MCA: 'CORPORATE',
      UDYAM: 'LICENSING',
      FSSAI: 'LICENSING',
    };
  }

  /**
   * Group compliance records by category code
   */
  groupRecordsByCategory(records = []) {
    const grouped = {
      TAX: [],
      LABOUR: [],
      CORPORATE: [],
      LICENSING: [],
    };

    for (const rec of records) {
      const categoryCode = this.AUTHORITY_CATEGORY_MAP[rec.authority] || 'CORPORATE';
      if (!grouped[categoryCode]) {
        grouped[categoryCode] = [];
      }
      grouped[categoryCode].push(rec);
    }

    return grouped;
  }

  /**
   * Evaluate raw score (0-100) per category based on status ratios
   */
  evaluateCategories(records = [], categories = []) {
    const grouped = this.groupRecordsByCategory(records);
    const categoryResults = {};

    const activeCodes = categories.map((c) => c.category_code || c);

    for (const code of activeCodes) {
      const recs = grouped[code] || [];
      let score = 100;
      let compliantCount = 0;
      let dueCount = 0;
      let overdueCount = 0;
      let exemptCount = 0;

      if (recs.length > 0) {
        for (const r of recs) {
          if (r.status === 'COMPLIANT') compliantCount++;
          else if (r.status === 'DUE') {
            dueCount++;
            score -= 15;
          } else if (r.status === 'OVERDUE') {
            overdueCount++;
            score -= 35;
          } else if (r.status === 'EXEMPT') exemptCount++;
        }
      }

      // Clamp category score between 0 and 100
      const clampedScore = Math.max(0, Math.min(100, score));

      categoryResults[code] = {
        categoryCode: code,
        score: clampedScore,
        totalItems: recs.length,
        compliantCount,
        dueCount,
        overdueCount,
        exemptCount,
      };
    }

    return categoryResults;
  }
}

module.exports = new CategoryEvaluator();
