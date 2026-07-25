/**
 * BusinessContextBuilder.js
 * Business Profile & Organization Context Builder.
 */

const defaultPrisma = require('../../../utils/prismaClient');

class BusinessContextBuilder {
  async buildContext({ msmeId = 1 }) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const msme = await defaultPrisma.msmeProfile.findUnique({
      where: { id: parsedId },
    }).catch(() => null);

    return {
      msmeId: parsedId,
      organizationName: msme?.company_name || 'VerifyChain Enterprise MSME',
      gstin: msme?.gstin || '27AAACV1234F1Z1',
      pan: msme?.pan || 'AAACV1234F',
      industryType: msme?.industry_type || 'Manufacturing & Trade',
      verificationStatus: msme?.verification_status || 'VERIFIED',
      location: { state: msme?.state || 'Maharashtra', city: msme?.city || 'Mumbai' },
    };
  }
}

module.exports = new BusinessContextBuilder();
