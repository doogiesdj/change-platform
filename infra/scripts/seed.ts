import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { code: 'GOV', name: '정치/행정', nameEn: 'Government', level: 1, sortOrder: 1 },
    { code: 'SOC', name: '사회/복지', nameEn: 'Society', level: 1, sortOrder: 2 },
    { code: 'EDU', name: '교육', nameEn: 'Education', level: 1, sortOrder: 3 },
    { code: 'HEL', name: '보건/의료', nameEn: 'Health', level: 1, sortOrder: 4 },
    { code: 'ENV', name: '환경', nameEn: 'Environment', level: 1, sortOrder: 5 },
    { code: 'ANI', name: '동물권', nameEn: 'Animal Rights', level: 1, sortOrder: 6 },
    { code: 'LAB', name: '노동', nameEn: 'Labor', level: 1, sortOrder: 7 },
    { code: 'JUS', name: '사법/인권', nameEn: 'Justice', level: 1, sortOrder: 8 },
    { code: 'TEC', name: '과학/기술', nameEn: 'Technology', level: 1, sortOrder: 9 },
    { code: 'COM', name: '지역사회', nameEn: 'Community', level: 1, sortOrder: 10 },
    { code: 'MIX', name: '복합이슈', nameEn: 'Mixed', level: 1, sortOrder: 11 },
    { code: 'UNC', name: '미분류', nameEn: 'Uncategorized', level: 1, sortOrder: 12 },
    { code: 'REV', name: '검토대기', nameEn: 'Review Pending', level: 1, sortOrder: 13 },
  ];

  for (const cat of categories) {
    await prisma.petitionCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }

  // Seed admin user
  const adminPassword = await bcrypt.hash('admin1234!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@change.kr' },
    update: {},
    create: {
      email: 'admin@change.kr',
      passwordHash: adminPassword,
      displayName: '관리자',
      role: 'admin',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
