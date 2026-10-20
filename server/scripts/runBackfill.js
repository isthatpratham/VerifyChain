/**
 * runBackfill.js
 * Explicit administrative and deployment-time backfill runner.
 * Safely executes idempotent trust lifecycle backfill outside the request-serving path.
 */
require('dotenv').config();
const { validateEnv } = require('../src/utils/envValidator');
const trustLifecycleBackfillService = require('../src/services/trustLifecycleBackfill.service');
const prisma = require('../src/utils/prismaClient');

async function main() {
  console.log('[Backfill CLI] Validating environment configuration...');
  validateEnv();

  console.log('[Backfill CLI] Starting administrative trust lifecycle backfill...');
  const result = await trustLifecycleBackfillService.runBackfill();

  console.log('[Backfill CLI] Backfill execution finished:');
  console.log(JSON.stringify(result, null, 2));

  await prisma.$disconnect();

  if (!result.success) {
    process.exit(1);
  }
}

main().catch(async (err) => {
  console.error('[Backfill CLI] Fatal backfill error:', err);
  try {
    await prisma.$disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
