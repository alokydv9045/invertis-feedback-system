/**
 * fix-logins.js
 * Force-upserts every account listed in CREDENTIALS.md so all logins work.
 * Run once:  node fix-logins.js
 */

import { PrismaClient } from '@prisma/client';
import pkg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pkg;
const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('🔧  Fixing all logins from CREDENTIALS.md …\n');

  // ── hashed passwords ───────────────────────────────────────────
  const [hSupreme, hAdmin, hCoord, hHod, hStudent] = await Promise.all([
    bcrypt.hash('Super@123',    10),
    bcrypt.hash('Admin@2025',   10),
    bcrypt.hash('Coord@2025',   10),
    bcrypt.hash('Hod@2025',     10),
    bcrypt.hash('Student@2025', 10),
  ]);

  // ── 1. Supreme Authority ───────────────────────────────────────
  const supremeAccounts = [
    { name: 'SUPAdmin1', email: 'supauth1@invertis.edu.in', student_id: 'SUPAUTH1' },
    { name: 'SUPAdmin2', email: 'supauth2@invertis.edu.in', student_id: 'SUPAUTH2' },
    { name: 'SUPAdmin3', email: 'supauth3@invertis.edu.in', student_id: 'SUPAUTH3' },
  ];
  for (const acc of supremeAccounts) {
    await prisma.user.upsert({
      where:  { email: acc.email },
      update: { password: hSupreme, status: 'active', role: 'supreme', student_id: acc.student_id },
      create: { ...acc, password: hSupreme, role: 'supreme', status: 'active' },
    });
    console.log(`  ✅ Supreme  ${acc.email} (ID: ${acc.student_id})`);
  }

  // ── 2. Super Admin ─────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin@invertis.edu.in' },
    update: { password: hAdmin, status: 'active', role: 'super_admin', name: 'Vikram Chandra', student_id: 'SUPADMIN1' },
    create: { name: 'Vikram Chandra', email: 'admin@invertis.edu.in', password: hAdmin, role: 'super_admin', student_id: 'SUPADMIN1', status: 'active' },
  });
  console.log('  ✅ Super Admin  admin@invertis.edu.in (ID: SUPADMIN1)');

  // ── 3. Coordinators ────────────────────────────────────────────
  const coordinators = [
    { name: 'Academic Coordinator', email: 'coordinator@invertis.edu.in', student_id: 'COORD1' },
    { name: 'Coordinator 2',        email: 'coordinator2@invertis.edu.in', student_id: 'COORD2' },
    { name: 'Coordinator 3',        email: 'coordinator3@invertis.edu.in', student_id: 'COORD3' },
  ];
  for (const acc of coordinators) {
    await prisma.user.upsert({
      where:  { email: acc.email },
      update: { password: hCoord, status: 'active', role: 'coordinator', student_id: acc.student_id },
      create: { ...acc, password: hCoord, role: 'coordinator', status: 'active' },
    });
    console.log(`  ✅ Coordinator  ${acc.email} (ID: ${acc.student_id})`);
  }

  // ── 4. HODs ────────────────────────────────────────────────────
  const hodAccounts = [
    { email: 'hod.bcs@invertis.edu.in', student_id: 'HOD1' },
    { email: 'hod.btai@invertis.edu.in', student_id: 'HOD2' },
    { email: 'hod.btce@invertis.edu.in', student_id: 'HOD3' },
    { email: 'hod.btec@invertis.edu.in', student_id: 'HOD4' },
    { email: 'hod.btme@invertis.edu.in', student_id: 'HOD5' },
  ];
  for (const acc of hodAccounts) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (existing) {
      await prisma.user.update({
        where:  { email: acc.email },
        data:   { password: hHod, status: 'active', student_id: acc.student_id },
      });
      console.log(`  ✅ HOD (updated)  ${acc.email} (ID: ${acc.student_id})`);
    } else {
      console.log(`  ⚠️  HOD not found (skipped — needs dept_id):  ${acc.email}`);
    }
  }

  // ── 5. Active Students ─────────────────────────────────────────
  const studentIds = [
    { id: 'BTAI2025_01', email: 'btai2025.01@iu.edu.in' },
    { id: 'BCS2025_01',  email: 'bcs2025.01@iu.edu.in'  },
    { id: 'BTEC2025_01', email: 'btec2025.01@iu.edu.in' },
  ];
  for (const s of studentIds) {
    const existing = await prisma.user.findUnique({ where: { student_id: s.id } });
    if (existing) {
      await prisma.user.update({
        where: { student_id: s.id },
        data:  { password: hStudent, status: 'active', email: s.email },
      });
      console.log(`  ✅ Student  ${s.id}`);
    } else {
      console.log(`  ⚠️  Student not found (run full seed first):  ${s.id}`);
    }
  }

  // ── Also force-reset ALL active students in the DB ─────────────
  const updated = await prisma.user.updateMany({
    where: { role: 'student', status: 'active' },
    data:  { password: hStudent },
  });
  console.log(`\n  ✅ Reset passwords for ${updated.count} active student accounts.`);

  console.log('\n🎉  All logins fixed! You can now log in with credentials from CREDENTIALS.md');
}

main()
  .catch(err => { console.error('❌ Error:', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
