const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [stProfiles, msmeProfiles] = await Promise.all([
    prisma.supplierTrustProfile.findMany(),
    prisma.msmeProfile.findMany(),
  ]);

  console.log('=== SUPPLIER TRUST PROFILES IN DB ===');
  console.table(stProfiles.map(p => ({
    id: p.id,
    msme_id: p.msme_id,
    display_name: p.display_name,
    public_slug: p.public_slug,
    public_identifier: p.public_identifier,
    is_public: p.is_public,
    trust_level: p.trust_level,
    verification_state: p.verification_state
  })));

  console.log('\n=== MSME PROFILES IN DB ===');
  console.table(msmeProfiles.map(m => ({
    id: m.id,
    user_id: m.user_id,
    business_name: m.business_name,
    gstin: m.gstin,
    udyam_number: m.udyam_number,
    is_profile_complete: m.is_profile_complete
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
