import { prisma } from './db.js';

async function drop() {
  console.log('Dropping all data from the database...');
  
  // Delete in reverse order of dependencies
  await prisma.answer.deleteMany({});
  await prisma.response.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.tlfq.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.sectionFaculty.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Database cleared.');
  await prisma.$disconnect();
  process.exit(0);
}

drop().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
