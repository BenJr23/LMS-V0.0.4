import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    { name: 'English', code: 'ENG' },
    { name: 'Filipino', code: 'FIL' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'Araling Panlipunan', code: 'AP' },
    { name: 'Edukasyon sa Pagpapakatao', code: 'ESP' },
    { name: 'Music', code: 'MUS' },
    { name: 'Arts', code: 'ART' },
    { name: 'Physical Education', code: 'PE' },
    { name: 'Health', code: 'HEALTH' },
    { name: 'TLE (Exploratory)', code: 'TLE' },
    { name: 'TLE (ICT – Computer)', code: 'TLE-ICT' },
    { name: 'TLE (Home Economics)', code: 'TLE-HE' },
    { name: 'TLE (Agri-Fishery Arts)', code: 'TLE-AFA' },
    { name: 'TLE (Industrial Arts)', code: 'TLE-IA' }
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: {
        name: subject.name,
        code: subject.code,
        createdById: 'ruben-bertuso-generated', // generate random user string
      },
    });
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
