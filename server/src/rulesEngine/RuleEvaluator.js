/**
 * RuleEvaluator.js
 * Generic, deterministic condition evaluation engine.
 * Evaluates structured JSON rule conditions against a business profile snapshot.
 * Contains ZERO compliance-specific business logic.
 */

class RuleEvaluator {
  /**
   * Evaluate a single condition clause against input snapshot
   */
  evaluateCondition(condition, inputSnapshot) {
    const { field, operator, expected } = condition;
    const actual = inputSnapshot[field];

    let matched = false;

    switch (operator) {
      case 'equals':
        matched = actual === expected;
        break;

      case 'not_equals':
        matched = actual !== expected;
        break;

      case 'greater_than':
        matched = typeof actual === 'number' && actual > expected;
        break;

      case 'greater_than_or_equal':
        matched = typeof actual === 'number' && actual >= expected;
        break;

      case 'less_than':
        matched = typeof actual === 'number' && actual < expected;
        break;

      case 'less_than_or_equal':
        matched = typeof actual === 'number' && actual <= expected;
        break;

      case 'in':
        matched = Array.isArray(expected) && expected.includes(actual);
        break;

      case 'not_in':
        matched = Array.isArray(expected) && !expected.includes(actual);
        break;

      case 'contains':
        matched =
          typeof actual === 'string' &&
          typeof expected === 'string' &&
          actual.toLowerCase().includes(expected.toLowerCase());
        break;

      case 'not_empty':
        matched = actual !== undefined && actual !== null && String(actual).trim() !== '';
        break;

      case 'is_empty':
        matched = actual === undefined || actual === null || String(actual).trim() === '';
        break;

      default:
        matched = false;
    }

    return {
      field,
      operator,
      expected,
      actual,
      matched,
    };
  }

  /**
   * Evaluate logical groups (all / any) within rule conditions
   */
  evaluateRule(rule, inputSnapshot) {
    const conditions = rule.conditions || {};
    const results = [];

    // Evaluate 'all' (AND) condition group
    let allMatched = true;
    if (Array.isArray(conditions.all) && conditions.all.length > 0) {
      for (const cond of conditions.all) {
        const res = this.evaluateCondition(cond, inputSnapshot);
        results.push(res);
        if (!res.matched) {
          allMatched = false;
        }
      }
    }

    // Evaluate 'any' (OR) condition group
    let anyMatched = true;
    if (Array.isArray(conditions.any) && conditions.any.length > 0) {
      anyMatched = false;
      for (const cond of conditions.any) {
        const res = this.evaluateCondition(cond, inputSnapshot);
        results.push(res);
        if (res.matched) {
          anyMatched = true;
        }
      }
    }

    const isApplicable = allMatched && anyMatched;
    const explanation = isApplicable
      ? rule.success_explanation
      : rule.failure_explanation;

    return {
      ruleId: rule.rule_id,
      ruleName: rule.rule_name,
      authority: rule.authority,
      priority: rule.priority,
      isApplicable,
      matchedConditions: results,
      explanation,
    };
  }
}

module.exports = new RuleEvaluator();
