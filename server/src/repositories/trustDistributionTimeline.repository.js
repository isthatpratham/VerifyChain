const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TrustDistributionTimelineRepository {
  async findByIdentityId(identityId) {
    return prisma.trustDistributionTimelineEvent.findMany({
      where: { trust_distribution_identity_id: identityId },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data) {
    return prisma.trustDistributionTimelineEvent.create({
      data,
    });
  }
}

module.exports = new TrustDistributionTimelineRepository();
