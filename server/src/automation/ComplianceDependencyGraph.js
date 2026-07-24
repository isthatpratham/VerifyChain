/**
 * ComplianceDependencyGraph.js
 * Dependency graph mapping business profile fields to statutory authorities
 * and score categories for selective recalculations.
 */

class ComplianceDependencyGraph {
  constructor() {
    this.FIELD_AUTHORITY_MAP = {
      gstin: ['GST'],
      employee_count: ['EPFO', 'ESIC'],
      annual_turnover_lakh: ['GST', 'MCA'],
      is_food_business: ['FSSAI'],
      udyam_number: ['UDYAM'],
      state: ['GST', 'MCA'],
      sector: ['GST', 'MCA'],
      business_type: ['GST', 'MCA'],
    };

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
   * Determine affected authorities based on updated profile fields
   */
  getAffectedAuthorities(changedFields = []) {
    const authorities = new Set();
    for (const field of changedFields) {
      const mapped = this.FIELD_AUTHORITY_MAP[field];
      if (mapped) {
        mapped.forEach((a) => authorities.add(a));
      }
    }
    // Default to all if no specific mapping matched
    return authorities.size > 0 ? Array.from(authorities) : ['GST', 'EPFO', 'ESIC', 'MCA', 'UDYAM', 'FSSAI'];
  }

  /**
   * Determine affected categories based on affected authorities
   */
  getAffectedCategories(authorities = []) {
    const categories = new Set();
    for (const auth of authorities) {
      const cat = this.AUTHORITY_CATEGORY_MAP[auth];
      if (cat) categories.add(cat);
    }
    return Array.from(categories);
  }

  /**
   * Full graph mapping overview
   */
  getGraphOverview() {
    return {
      fieldToAuthorities: this.FIELD_AUTHORITY_MAP,
      authorityToCategories: this.AUTHORITY_CATEGORY_MAP,
    };
  }
}

module.exports = new ComplianceDependencyGraph();
