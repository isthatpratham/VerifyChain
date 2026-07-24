const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TrustDistributionIdentityRepository {
  async findBySupplierTrustProfileId(profileId) {
    return prisma.trustDistributionIdentity.findUnique({
      where: { supplier_trust_profile_id: profileId },
      include: {
        config: true,
      },
    });
  }

  async findByStableId(stableId) {
    return prisma.trustDistributionIdentity.findUnique({
      where: { stable_distribution_id: stableId },
      include: {
        config: true,
      },
    });
  }

  async create(data) {
    return prisma.trustDistributionIdentity.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.trustDistributionIdentity.update({
      where: { id },
      data,
    });
  }
}

module.exports = new TrustDistributionIdentityRepository();
