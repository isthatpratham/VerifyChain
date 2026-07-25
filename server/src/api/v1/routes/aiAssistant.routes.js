/**
 * aiAssistant.routes.js
 * REST API Routes for Phase 9.4 AI Compliance Assistant (/api/v1/ai-assistant).
 */

const express = require('express');
const { AIAssistant } = require('../../../aiAssistant');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Post Message / Start Conversation
 * POST /api/v1/ai-assistant/conversations/messages
 */
router.post('/conversations/messages', requireScope('ai.assistant.use'), async (req, res) => {
  try {
    const { conversationId, query } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const userId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';

    if (!query) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_QUERY', message: 'Query string is required.' });
    }

    const result = await AIAssistant.processMessage({
      conversationId,
      userQuery: query,
      msmeId,
      userId,
    });

    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ASSISTANT_PROCESS_ERROR', message: 'Failed to process message.', details: err.message });
  }
});

/**
 * List Active Conversations
 * GET /api/v1/ai-assistant/conversations
 */
router.get('/conversations', requireScope('ai.assistant.use'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const conversations = await AIAssistant.getConversations(msmeId);
    return sendSuccess(res, { statusCode: 200, data: conversations });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONVERSATIONS_FETCH_ERROR', message: 'Failed to fetch conversations.', details: err.message });
  }
});

/**
 * Generate Compliance Report
 * POST /api/v1/ai-assistant/reports/generate
 */
router.post('/reports/generate', requireScope('ai.assistant.reports'), async (req, res) => {
  try {
    const { reportType } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;

    const report = await AIAssistant.generateReport({ msmeId, reportType: reportType || 'BOARD_REPORT' });
    return sendSuccess(res, { statusCode: 200, data: report });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'REPORT_GENERATE_ERROR', message: 'Failed to generate report.', details: err.message });
  }
});

/**
 * Submit Feedback Rating
 * POST /api/v1/ai-assistant/feedback
 */
router.post('/feedback', requireScope('ai.assistant.use'), async (req, res) => {
  try {
    const { conversationId, rating, feedbackText } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;

    const feedback = await AIAssistant.submitFeedback({ msmeId, conversationId, rating, feedbackText });
    return sendSuccess(res, { statusCode: 200, data: feedback });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'FEEDBACK_SUBMIT_ERROR', message: 'Failed to submit feedback.', details: err.message });
  }
});

module.exports = router;
