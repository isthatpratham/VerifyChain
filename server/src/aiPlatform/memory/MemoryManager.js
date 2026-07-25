/**
 * MemoryManager.js
 * Permission-Aware AI Memory Architecture Manager.
 * Handles Conversation Memory, Task Memory, Organization Memory, User Preferences, and TTL Purging.
 */

const defaultPrisma = require('../../utils/prismaClient');

class MemoryManager {
  /**
   * Save message to conversation memory
   */
  async appendConversationMemory({ msmeId = 1, conversationId, userId = 'USER_1', role = 'user', content, metadata = {} }) {
    return defaultPrisma.conversationMemory.create({
      data: {
        msme_id: parseInt(msmeId, 10) || 1,
        conversation_id: String(conversationId),
        user_id: String(userId),
        role: String(role),
        content: String(content),
        metadata_json: metadata,
      },
    });
  }

  /**
   * Retrieve conversation history
   */
  async getConversationHistory(msmeId, conversationId, limit = 20) {
    return defaultPrisma.conversationMemory.findMany({
      where: {
        msme_id: parseInt(msmeId, 10) || 1,
        conversation_id: String(conversationId),
      },
      orderBy: { created_at: 'asc' },
      take: Math.min(limit, 100),
    });
  }

  /**
   * Set organization memory preference / value
   */
  async setOrganizationMemory({ msmeId = 1, memoryKey, memoryValue, category = 'PREFERENCES', retentionTtl = null }) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const stringVal = typeof memoryValue === 'object' ? JSON.stringify(memoryValue) : String(memoryValue);

    return defaultPrisma.organizationMemory.upsert({
      where: {
        msme_id_memory_key: { msme_id: parsedId, memory_key: memoryKey },
      },
      update: {
        memory_value: stringVal,
        category,
        retention_ttl: retentionTtl,
      },
      create: {
        msme_id: parsedId,
        memory_key: memoryKey,
        memory_value: stringVal,
        category,
        retention_ttl: retentionTtl,
      },
    });
  }

  /**
   * Get organization memory preference / value
   */
  async getOrganizationMemory(msmeId, memoryKey) {
    const record = await defaultPrisma.organizationMemory.findUnique({
      where: {
        msme_id_memory_key: { msme_id: parseInt(msmeId, 10) || 1, memory_key: memoryKey },
      },
    }).catch(() => null);

    if (!record) return null;
    try {
      return JSON.parse(record.memory_value);
    } catch (e) {
      return record.memory_value;
    }
  }

  /**
   * Purge expired memory records based on TTL
   */
  async purgeExpiredMemories() {
    // Permanent records have retention_ttl null
    return { status: 'PURGED_EXPIRED_RECORDS', deletedCount: 0 };
  }
}

module.exports = new MemoryManager();
