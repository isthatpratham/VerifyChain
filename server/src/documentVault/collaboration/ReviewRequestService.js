/**
 * ReviewRequestService.js
 * Review Workflow Foundation & Reviewer Assignment for Enterprise Vault (Phase 10.4).
 */

const defaultPrisma = require('../../utils/prismaClient');

class ReviewRequestService {
  /**
   * Create a Document Review Request with assigned reviewers
   */
  static async createReviewRequest({ assetId, requesterId, title, notes, priority = 'MEDIUM', dueDate, reviewers = [], msmeId = 1 }, client = defaultPrisma) {
    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) {
      throw new Error(`Asset '${assetId}' not found`);
    }

    const reviewReq = await client.vaultReviewRequest.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        requester_id: String(requesterId),
        title: title || `Review Request for ${asset.title}`,
        notes,
        priority: priority.toUpperCase(),
        due_date: dueDate ? new Date(dueDate) : null,
        participants: {
          create: reviewers.map(rId => ({
            reviewer_id: String(rId),
            status: 'PENDING',
          })),
        },
      },
      include: { participants: true },
    });

    // Log Activity
    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        actor_id: String(requesterId),
        event_type: 'REVIEW_REQUESTED',
        summary: `Review requested for '${asset.title}' (${reviewers.length} reviewer(s))`,
        details: { request_id: reviewReq.request_id, priority, reviewers },
      },
    });

    return reviewReq;
  }

  /**
   * Respond to / Complete a Review Request
   */
  static async updateReviewStatus({ requestId, reviewerId, status, notes, msmeId = 1 }, client = defaultPrisma) {
    const request = await client.vaultReviewRequest.findFirst({
      where: {
        OR: [
          { request_id: requestId },
          { id: isNaN(Number(requestId)) ? -1 : Number(requestId) },
        ],
        msme_id: msmeId,
      },
      include: { participants: true },
    });

    if (!request) {
      throw new Error(`Review Request '${requestId}' not found`);
    }

    const participant = request.participants.find(p => p.reviewer_id === String(reviewerId));
    if (participant) {
      await client.vaultReviewParticipant.update({
        where: { id: participant.id },
        data: {
          status: status.toUpperCase(),
          notes,
          reviewed_at: new Date(),
        },
      });
    }

    // Check if all reviewers completed
    const updatedParticipants = await client.vaultReviewParticipant.findMany({
      where: { request_id: request.id },
    });

    const allFinished = updatedParticipants.every(p => ['COMPLETED', 'DECLINED'].includes(p.status));
    const overallStatus = allFinished ? 'COMPLETED' : status.toUpperCase();

    const updatedRequest = await client.vaultReviewRequest.update({
      where: { id: request.id },
      data: { status: overallStatus },
      include: { participants: true },
    });

    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: request.asset_id,
        actor_id: String(reviewerId),
        event_type: 'REVIEW_COMPLETED',
        summary: `Reviewer '${reviewerId}' updated review status to '${status}'`,
      },
    });

    return updatedRequest;
  }

  /**
   * List Review Requests for an asset
   */
  static async getAssetReviewRequests(assetId, msmeId = 1, client = defaultPrisma) {
    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) return [];

    return await client.vaultReviewRequest.findMany({
      where: { asset_id: asset.id, msme_id: msmeId },
      include: { participants: true },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = ReviewRequestService;
