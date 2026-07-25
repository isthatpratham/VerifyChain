/**
 * ModelRegistry.js
 * Centralized AI Model Registry Service.
 */

const defaultPrisma = require('../../utils/prismaClient');
const builtinModels = require('./builtinModels');

class ModelRegistry {
  constructor() {
    this.memoryModels = new Map(builtinModels.map((m) => [m.modelCode, m]));
  }

  /**
   * Get model metadata
   * @param {string} modelCode
   */
  async getModel(modelCode) {
    if (!modelCode) return this.getDefaultModel();
    const dbModel = await defaultPrisma.aIModel.findUnique({
      where: { model_code: modelCode },
    }).catch(() => null);

    if (dbModel) return dbModel;
    return this.memoryModels.get(modelCode) || this.getDefaultModel();
  }

  /**
   * Get default platform model
   */
  getDefaultModel() {
    return this.memoryModels.get('mock-gpt-4o') || builtinModels[0];
  }

  /**
   * List all registered models with capabilities & pricing
   */
  async listModels() {
    const dbModels = await defaultPrisma.aIModel.findMany({
      include: { provider: true },
    }).catch(() => []);

    if (dbModels.length > 0) return dbModels;
    return builtinModels;
  }
}

module.exports = new ModelRegistry();
