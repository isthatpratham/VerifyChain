/**
 * ApprovalWorkflowEngine.js
 * Human Review & Approval Workflow Engine.
 */

const defaultPrisma = require('../../utils/prismaClient');

class ApprovalWorkflowEngine {
  /**
   * Process human review decision (Approve / Reject / Correction)
   */
  async processApproval({ analysisId, reviewerId = 'SYSTEM', decision = 'APPROVED', overriddenFields = {}, notes = '' }) {
    const dbAnalysis = await defaultPrisma.documentAnalysis.findUnique({
      where: { analysis_id: analysisId },
    }).catch(() => null);

    if (!dbAnalysis) {
      throw new Error(`Document analysis '${analysisId}' not found.`);
    }

    // Update document review status
    const updated = await defaultPrisma.documentAnalysis.update({
      where: { analysis_id: analysisId },
      data: { review_status: decision },
    });

    // Save decision audit record
    await defaultPrisma.approvalDecision.create({
      data: {
        document_analysis_id: dbAnalysis.id,
        decision,
        reviewer_id: reviewerId,
        overridden_fields_json: overriddenFields,
        notes,
      },
    }).catch(() => {});

    // Update overridden fields if provided
    if (overriddenFields && Object.keys(overriddenFields).length > 0) {
      for (const [key, val] of Object.entries(overriddenFields)) {
        await defaultPrisma.extractedField.updateMany({
          where: { document_analysis_id: dbAnalysis.id, field_key: key },
          data: { field_value: String(val), is_verified: true },
        }).catch(() => {});
      }
    }

    return {
      analysisId,
      reviewStatus: decision,
      reviewerId,
      overriddenFieldsCount: Object.keys(overriddenFields).length,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ApprovalWorkflowEngine();
