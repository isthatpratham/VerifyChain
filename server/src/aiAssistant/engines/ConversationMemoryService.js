/**
 * ConversationMemoryService.js
 * Multi-Turn Conversation Memory & Session History Manager.
 */

const defaultPrisma = require('../../utils/prismaClient');

class ConversationMemoryService {
  async getOrCreateConversation({ conversationId, msmeId = 1, userId = 'SYSTEM', title = 'Compliance Discussion' }) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const targetId = conversationId || `CONV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let conv = await defaultPrisma.assistantConversation.findUnique({
      where: { conversation_id: targetId },
      include: { messages: true, citations: true },
    }).catch(() => null);

    if (!conv) {
      conv = await defaultPrisma.assistantConversation.create({
        data: {
          msme_id: parsedId,
          conversation_id: targetId,
          user_id: userId,
          title,
          category: 'COMPLIANCE_INQUIRY',
          is_active: true,
        },
        include: { messages: true, citations: true },
      });
    }

    return conv;
  }

  async appendMessage({ conversationId, sender, content, confidenceScore = 0.96, reasoning = null, intentCode = null }) {
    const dbConv = await defaultPrisma.assistantConversation.findUnique({
      where: { conversation_id: conversationId },
    });

    if (!dbConv) return null;

    return defaultPrisma.conversationMessage.create({
      data: {
        conversation_id: dbConv.id,
        sender,
        content,
        confidence_score: confidenceScore,
        reasoning,
        intent_code: intentCode,
      },
    });
  }

  async getConversations(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    return defaultPrisma.assistantConversation.findMany({
      where: { msme_id: parsedId, is_active: true },
      include: { messages: true },
      orderBy: { updated_at: 'desc' },
    }).catch(() => []);
  }
}

module.exports = new ConversationMemoryService();
