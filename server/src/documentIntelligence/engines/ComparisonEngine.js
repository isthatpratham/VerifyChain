/**
 * ComparisonEngine.js
 * Document Versioning & Field Comparison Engine.
 */

class ComparisonEngine {
  /**
   * Compare two document field sets and return diffs & similarity score
   */
  compareDocuments(sourceFields = [], targetFields = []) {
    const diffs = [];
    let matchCount = 0;

    for (const sField of sourceFields) {
      const tField = targetFields.find((t) => t.fieldKey === sField.fieldKey);
      if (!tField) {
        diffs.push({ fieldKey: sField.fieldKey, status: 'REMOVED', oldValue: sField.fieldValue, newValue: null });
      } else if (tField.fieldValue !== sField.fieldValue) {
        diffs.push({ fieldKey: sField.fieldKey, status: 'CHANGED', oldValue: sField.fieldValue, newValue: tField.fieldValue });
      } else {
        matchCount++;
      }
    }

    const similarityScore = sourceFields.length > 0 ? Number((matchCount / sourceFields.length).toFixed(2)) : 1.0;

    return {
      similarityScore,
      fieldDiffs: diffs,
      missingSections: [],
    };
  }
}

module.exports = new ComparisonEngine();
