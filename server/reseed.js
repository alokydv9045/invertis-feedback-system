import { initDb, prisma } from './db.js';

async function reseed() {
  console.log('🚀 Manually triggering database re-seeding...');
  try {
    // We already know the DB is cleared because drop_db.js was just run.
    // initDb() will see no super_admin and perform the seed.
    await initDb();
    console.log('✅ Re-seeding completed successfully.');
  } catch (err) {
    console.error('❌ Re-seeding failed:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

reseed();
