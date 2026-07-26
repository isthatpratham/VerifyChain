/**
 * IdentityService.js
 * Core Identity & User Profile Orchestration for Enterprise Administration Platform (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');
const UserLifecycleService = require('./UserLifecycleService');

class IdentityService {
  /**
   * Create or Register a Platform User Identity
   */
  static async createUser(userData, client = defaultPrisma) {
    const existing = await client.user.findUnique({
      where: { email: userData.email.toLowerCase() },
    });

    if (existing) {
      throw new Error(`User with email '${userData.email}' already exists.`);
    }

    const user = await client.user.create({
      data: {
        email: userData.email.toLowerCase(),
        password_hash: userData.passwordHash || 'OAUTH_EXTERNAL_NO_LOCAL_PASS',
        name: userData.name,
        phone: userData.phone || null,
        role: userData.role || 'MSME_OWNER',
        is_active: userData.isActive !== false,
      },
    });

    // Initialize User Profile
    await client.userProfile.create({
      data: {
        user_id: user.id,
        display_name: userData.name,
        job_title: userData.jobTitle || 'Business User',
        department: userData.department || 'General',
        phone: userData.phone || null,
        timezone: userData.timezone || 'Asia/Kolkata',
        language: userData.language || 'en',
      },
    });

    // Record initial status history
    await client.userStatusHistory.create({
      data: {
        user_id: user.id,
        from_status: 'NONE',
        to_status: 'ACTIVE',
        reason: 'User Identity Provisioning',
        changed_by: userData.createdBy || 'ADMIN',
      },
    });

    return await this.getUserById(user.id, client);
  }

  /**
   * Get Identity Profile Details by User ID
   */
  static async getUserById(userId, client = defaultPrisma) {
    const user = await client.user.findFirst({
      where: { id: Number(userId) },
      include: {
        user_profile: true,
        memberships: {
          include: { organization: true },
        },
        status_histories: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new Error(`Platform User '${userId}' not found.`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      profile: user.user_profile,
      memberships: user.memberships,
      recentStatusHistory: user.status_histories,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  /**
   * List Platform Users with pagination & filter
   */
  static async listUsers(filterParams = {}, client = defaultPrisma) {
    const { role, isActive, query, limit = 20, offset = 0 } = filterParams;
    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.is_active = Boolean(isActive);
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      client.user.count({ where }),
      client.user.findMany({
        where,
        include: { user_profile: true, memberships: { include: { organization: true } } },
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
    ]);

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      users,
    };
  }
}

module.exports = IdentityService;
