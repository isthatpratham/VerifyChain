/**
 * ProfileAdministrationService.js
 * User Profile & Preference Administration Service (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

class ProfileAdministrationService {
  /**
   * Update User Profile Attributes & Preferences
   */
  static async updateProfile(userId, profileData, client = defaultPrisma) {
    const user = await client.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) throw new Error(`User '${userId}' not found for profile update.`);

    if (profileData.name || profileData.phone) {
      await client.user.update({
        where: { id: user.id },
        data: {
          name: profileData.name || user.name,
          phone: profileData.phone !== undefined ? profileData.phone : user.phone,
        },
      });
    }

    const updatedProfile = await client.userProfile.upsert({
      where: { user_id: user.id },
      update: {
        display_name: profileData.displayName || profileData.name || undefined,
        avatar_url: profileData.avatarUrl !== undefined ? profileData.avatarUrl : undefined,
        job_title: profileData.jobTitle !== undefined ? profileData.jobTitle : undefined,
        department: profileData.department !== undefined ? profileData.department : undefined,
        phone: profileData.phone !== undefined ? profileData.phone : undefined,
        timezone: profileData.timezone !== undefined ? profileData.timezone : undefined,
        language: profileData.language !== undefined ? profileData.language : undefined,
        preferences: profileData.preferences !== undefined ? profileData.preferences : undefined,
        custom_metadata: profileData.customMetadata !== undefined ? profileData.customMetadata : undefined,
      },
      create: {
        user_id: user.id,
        display_name: profileData.displayName || profileData.name || user.name,
        avatar_url: profileData.avatarUrl || null,
        job_title: profileData.jobTitle || 'Business User',
        department: profileData.department || 'General',
        phone: profileData.phone || user.phone || null,
        timezone: profileData.timezone || 'Asia/Kolkata',
        language: profileData.language || 'en',
        preferences: profileData.preferences || {},
        custom_metadata: profileData.customMetadata || {},
      },
    });

    return updatedProfile;
  }
}

module.exports = ProfileAdministrationService;
