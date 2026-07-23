const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@123', 10);

  // 1. Admin User
  await prisma.user.upsert({
    where: { email: 'admin@verifychain.dev' },
    update: {},
    create: {
      email: 'admin@verifychain.dev',
      password_hash: adminPasswordHash,
      name: 'System Admin',
      phone: '9999999999',
      role: 'ADMIN',
    },
  });

  // 2. MSME Owner 1 (HIGH Score profile)
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@verifychain.dev' },
    update: {},
    create: {
      email: 'owner1@verifychain.dev',
      password_hash: ownerPasswordHash,
      name: 'Ramesh Gupta',
      phone: '9876543210',
      role: 'MSME_OWNER',
    },
  });

  const msme1 = await prisma.msmeProfile.upsert({
    where: { user_id: owner1.id },
    update: {},
    create: {
      user_id: owner1.id,
      business_name: 'Gupta Textiles Pvt Ltd',
      gstin: '27AABCU9603R1ZX',
      udyam_number: 'UDYAM-MH-00-0012345',
      business_type: 'MANUFACTURING',
      sector: 'Textiles',
      state: 'Maharashtra',
      district: 'Surat',
      employee_count: 12,
      annual_turnover_lakh: 45.5,
      is_food_business: false,
      is_profile_complete: true,
      last_compliance_sync: new Date(),
    },
  });

  // 3. MSME Owner 2 (MEDIUM Score profile)
  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@verifychain.dev' },
    update: {},
    create: {
      email: 'owner2@verifychain.dev',
      password_hash: ownerPasswordHash,
      name: 'Priya Sharma',
      phone: '9876543211',
      role: 'MSME_OWNER',
    },
  });

  const msme2 = await prisma.msmeProfile.upsert({
    where: { user_id: owner2.id },
    update: {},
    create: {
      user_id: owner2.id,
      business_name: 'Sharma IT Solutions',
      gstin: '29AABCU9603R1ZY',
      udyam_number: 'UDYAM-KA-00-0054321',
      business_type: 'SERVICES',
      sector: 'IT Services',
      state: 'Karnataka',
      district: 'Bengaluru',
      employee_count: 8,
      annual_turnover_lakh: 30.0,
      is_food_business: false,
      is_profile_complete: true,
      last_compliance_sync: new Date(),
    },
  });

  // 4. MSME Owner 3 (LOW Score profile)
  const owner3 = await prisma.user.upsert({
    where: { email: 'owner3@verifychain.dev' },
    update: {},
    create: {
      email: 'owner3@verifychain.dev',
      password_hash: ownerPasswordHash,
      name: 'Anil Kumar',
      phone: '9876543212',
      role: 'MSME_OWNER',
    },
  });

  const msme3 = await prisma.msmeProfile.upsert({
    where: { user_id: owner3.id },
    update: {},
    create: {
      user_id: owner3.id,
      business_name: 'Kumar Foods',
      gstin: '07AABCU9603R1ZZ',
      udyam_number: 'UDYAM-DL-00-0098765',
      business_type: 'FOOD_PROCESSING',
      sector: 'Food Processing',
      state: 'Delhi',
      district: 'North Delhi',
      employee_count: 5,
      annual_turnover_lakh: 15.0,
      is_food_business: true,
      is_profile_complete: true,
      last_compliance_sync: new Date(),
    },
  });

  // 5. Compliance Records (6 per MSME = 18 total)
  const authorities = ['GST', 'EPFO', 'ESIC', 'MCA', 'UDYAM', 'FSSAI'];
  
  // Records for MSME 1 (High compliance)
  for (const auth of authorities) {
    const status = auth === 'FSSAI' ? 'EXEMPT' : 'COMPLIANT';
    await prisma.complianceRecord.upsert({
      where: { msme_id_authority: { msme_id: msme1.id, authority: auth } },
      update: {},
      create: {
        msme_id: msme1.id,
        authority: auth,
        status: status,
        expiry_date: auth === 'FSSAI' ? null : new Date('2027-03-31'),
        notes: `${auth} filings up to date`,
      },
    });
  }

  // Records for MSME 2 (Medium compliance)
  for (const auth of authorities) {
    let status = 'COMPLIANT';
    if (auth === 'ESIC' || auth === 'MCA') status = 'DUE';
    if (auth === 'FSSAI') status = 'EXEMPT';

    await prisma.complianceRecord.upsert({
      where: { msme_id_authority: { msme_id: msme2.id, authority: auth } },
      update: {},
      create: {
        msme_id: msme2.id,
        authority: auth,
        status: status,
        expiry_date: status === 'DUE' ? new Date(Date.now() + 15 * 86400000) : new Date('2027-03-31'),
        notes: `${auth} status: ${status}`,
      },
    });
  }

  // Records for MSME 3 (Low compliance)
  for (const auth of authorities) {
    let status = 'OVERDUE';
    if (auth === 'UDYAM') status = 'COMPLIANT';
    if (auth === 'FSSAI') status = 'DUE';

    await prisma.complianceRecord.upsert({
      where: { msme_id_authority: { msme_id: msme3.id, authority: auth } },
      update: {},
      create: {
        msme_id: msme3.id,
        authority: auth,
        status: status,
        expiry_date: status === 'OVERDUE' ? new Date(Date.now() - 10 * 86400000) : new Date(Date.now() + 7 * 86400000),
        notes: `${auth} status: ${status}`,
      },
    });
  }

  // 6. Documents (2 per MSME = 6 total)
  const docsData = [
    { msmeId: msme1.id, type: 'GST_CERTIFICATE', auth: 'GST', name: 'gst_cert_msme1.pdf' },
    { msmeId: msme1.id, type: 'UDYAM_CERTIFICATE', auth: 'UDYAM', name: 'udyam_cert_msme1.pdf' },
    { msmeId: msme2.id, type: 'GST_CERTIFICATE', auth: 'GST', name: 'gst_cert_msme2.pdf' },
    { msmeId: msme2.id, type: 'EPFO_CERTIFICATE', auth: 'EPFO', name: 'epfo_cert_msme2.pdf' },
    { msmeId: msme3.id, type: 'FSSAI_LICENSE', auth: 'FSSAI', name: 'fssai_license_msme3.pdf' },
    { msmeId: msme3.id, type: 'UDYAM_CERTIFICATE', auth: 'UDYAM', name: 'udyam_cert_msme3.pdf' },
  ];

  for (const doc of docsData) {
    const existing = await prisma.document.findFirst({
      where: { msme_id: doc.msmeId, document_type: doc.type },
    });
    if (!existing) {
      await prisma.document.create({
        data: {
          msme_id: doc.msmeId,
          document_type: doc.type,
          authority: doc.auth,
          file_name: doc.name,
          file_path: `uploads/${doc.name}`,
          file_size_kb: 250,
          validity_date: new Date('2027-03-31'),
        },
      });
    }
  }

  // 7. Government Schemes (Representative sample)
  const sampleScheme = await prisma.governmentScheme.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      scheme_name: 'CGTMSE — Credit Guarantee Scheme',
      ministry: 'Ministry of MSME',
      description: 'Collateral-free credit facility for micro and small enterprises.',
      eligibility_criteria: {
        business_types: ['MANUFACTURING', 'SERVICES', 'FOOD_PROCESSING'],
        min_employees: 0,
        max_employees: 50,
      },
      benefit_type: 'Credit Guarantee',
      max_benefit_lakh: 200.0,
      application_url: 'https://www.cgtmse.in',
      is_active: true,
    },
  });

  // 8. Scheme Match
  await prisma.schemeMatch.upsert({
    where: { msme_id_scheme_id: { msme_id: msme1.id, scheme_id: sampleScheme.id } },
    update: {},
    create: {
      msme_id: msme1.id,
      scheme_id: sampleScheme.id,
      match_score: 92,
      match_reasons: ['Manufacturing business', 'Employee count <= 50'],
    },
  });

  // 9. Alerts
  const compRecord2 = await prisma.complianceRecord.findUnique({
    where: { msme_id_authority: { msme_id: msme2.id, authority: 'ESIC' } },
  });

  if (compRecord2) {
    await prisma.alert.upsert({
      where: {
        msme_id_compliance_record_id_threshold: {
          msme_id: msme2.id,
          compliance_record_id: compRecord2.id,
          threshold: 'DAYS_15',
        },
      },
      update: {},
      create: {
        msme_id: msme2.id,
        compliance_record_id: compRecord2.id,
        threshold: 'DAYS_15',
        status: 'SENT',
        scheduled_for: new Date(),
        sent_at: new Date(),
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
