/**
 * MetadataEvolutionEngine.js
 * Tracks metadata evolution and computes detailed field-level deltas across versions (Phase 10.2).
 */

class MetadataEvolutionEngine {
  /**
   * Compute Field Deltas between old and new metadata objects
   */
  static computeMetadataDeltas(oldMetadata = {}, newMetadata = {}) {
    const deltas = [];

    const flatten = (obj, prefix = '') => {
      const result = {};
      if (!obj || typeof obj !== 'object') return result;

      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(result, flatten(value, path));
        } else {
          result[path] = value;
        }
      }
      return result;
    };

    const flatOld = flatten(oldMetadata);
    const flatNew = flatten(newMetadata);

    const allKeys = new Set([...Object.keys(flatOld), ...Object.keys(flatNew)]);

    for (const key of allKeys) {
      const prevVal = flatOld[key];
      const newVal = flatNew[key];

      if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
        deltas.push({
          fieldName: key,
          previousValue: prevVal !== undefined ? JSON.stringify(prevVal) : null,
          newValue: newVal !== undefined ? JSON.stringify(newVal) : null,
          changeType: key.startsWith('ai_metadata') ? 'AI_REANALYSIS' : 'METADATA_UPDATE',
        });
      }
    }

    return deltas;
  }
}

module.exports = MetadataEvolutionEngine;
