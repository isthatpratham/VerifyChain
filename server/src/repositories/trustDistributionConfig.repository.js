const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TrustDistributionConfigRepository {
  async findByDistributionIdentityId(identityId) {
    return prisma.trustDistributionConfig.findUnique({
      where: { trust_distribution_identity_id: identityId },
    });
  }

  async create(data) {
    return prisma.trustDistributionConfig.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.trustDistributionConfig.update({
      where: { id },
      data,
    });
  }
}

module.exports = new TrustDistributionConfigRepository();
