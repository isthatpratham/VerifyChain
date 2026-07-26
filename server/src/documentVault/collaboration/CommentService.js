/**
 * CommentService.js
 * Threaded Discussions & Mention Parsing Service for Enterprise Vault (Phase 10.4).
 */

const defaultPrisma = require('../../utils/prismaClient');

class CommentService {
  /**
   * Post a new comment or threaded reply with @mention parsing
   */
  static async addComment({ assetId, userId, userName = 'User', content, parentId = null, msmeId = 1 }, client = defaultPrisma) {
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

    const comment = await client.vaultComment.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        parent_id: parentId ? Number(parentId) : null,
        user_id: String(userId),
        user_name: userName,
        content,
      },
    });

    // Parse @Mentions in content (e.g., @User_101 or @Role_Compliance)
    const mentions = this.extractMentions(content);
    if (mentions.length > 0) {
      for (const m of mentions) {
        await client.vaultMention.create({
          data: {
            comment_id: comment.id,
            mention_type: m.type,
            mentioned_id: m.id,
          },
        });
      }
    }

    // Log Activity
    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        actor_id: String(userId),
        event_type: 'COMMENT_ADDED',
        summary: `User '${userName}' added a comment on '${asset.title}'`,
        details: { comment_id: comment.comment_id, mentionsCount: mentions.length },
      },
    });

    return { ...comment, parsedMentions: mentions };
  }

  /**
   * Extract @User and @Role pattern mentions from comment text
   */
  static extractMentions(text) {
    if (!text) return [];
    const mentionRegex = /@([A-Za-z0-9_-]+)/g;
    const matches = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const raw = match[1];
      if (raw.toLowerCase().startsWith('role_') || raw.toLowerCase().startsWith('admin') || raw.toLowerCase().startsWith('reviewer')) {
        matches.push({ type: 'ROLE', id: raw.toUpperCase() });
      } else {
        matches.push({ type: 'USER', id: raw });
      }
    }
    return matches;
  }

  /**
   * Get all threaded comments for an asset
   */
  static async getComments(assetId, msmeId = 1, client = defaultPrisma) {
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

    const rootComments = await client.vaultComment.findMany({
      where: { asset_id: asset.id, parent_id: null, msme_id: msmeId },
      include: {
        replies: { include: { mentions: true }, orderBy: { created_at: 'asc' } },
        mentions: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return rootComments;
  }

  /**
   * Resolve or Reopen a comment thread
   */
  static async resolveComment({ commentId, userId, isResolved = true, msmeId = 1 }, client = defaultPrisma) {
    const comment = await client.vaultComment.findFirst({
      where: {
        OR: [
          { comment_id: commentId },
          { id: isNaN(Number(commentId)) ? -1 : Number(commentId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!comment) {
      throw new Error(`Comment '${commentId}' not found`);
    }

    const updated = await client.vaultComment.update({
      where: { id: comment.id },
      data: {
        is_resolved: isResolved,
        resolved_by: isResolved ? String(userId) : null,
        resolved_at: isResolved ? new Date() : null,
      },
    });

    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: comment.asset_id,
        actor_id: String(userId),
        event_type: isResolved ? 'COMMENT_RESOLVED' : 'COMMENT_REOPENED',
        summary: `Comment thread ${isResolved ? 'resolved' : 'reopened'}`,
      },
    });

    return updated;
  }
}

module.exports = CommentService;
