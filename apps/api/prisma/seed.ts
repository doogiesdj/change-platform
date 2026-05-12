import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ── Regions (17 시도) ────────────────────────────────────────────────────
  const regions = [
    { code: 'SEOUL',    label: '서울특별시',        level: 1, sortOrder: 1 },
    { code: 'BUSAN',    label: '부산광역시',          level: 1, sortOrder: 2 },
    { code: 'DAEGU',    label: '대구광역시',          level: 1, sortOrder: 3 },
    { code: 'INCHEON',  label: '인천광역시',          level: 1, sortOrder: 4 },
    { code: 'GWANGJU',  label: '광주광역시',          level: 1, sortOrder: 5 },
    { code: 'DAEJEON',  label: '대전광역시',          level: 1, sortOrder: 6 },
    { code: 'ULSAN',    label: '울산광역시',          level: 1, sortOrder: 7 },
    { code: 'SEJONG',   label: '세종특별자치시',      level: 1, sortOrder: 8 },
    { code: 'GYEONGGI', label: '경기도',              level: 1, sortOrder: 9 },
    { code: 'GANGWON',  label: '강원특별자치도',      level: 1, sortOrder: 10 },
    { code: 'CHUNGBUK', label: '충청북도',            level: 1, sortOrder: 11 },
    { code: 'CHUNGNAM', label: '충청남도',            level: 1, sortOrder: 12 },
    { code: 'JEONBUK',  label: '전북특별자치도',      level: 1, sortOrder: 13 },
    { code: 'JEONNAM',  label: '전라남도',            level: 1, sortOrder: 14 },
    { code: 'GYEONGBUK',label: '경상북도',            level: 1, sortOrder: 15 },
    { code: 'GYEONGNAM',label: '경상남도',            level: 1, sortOrder: 16 },
    { code: 'JEJU',     label: '제주특별자치도',      level: 1, sortOrder: 17 },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: { label: region.label },
      create: region,
    });
  }
  console.log(`✓ ${regions.length}개 지역 시드 완료`);

  // ── Categories ───────────────────────────────────────────────────────────
  const categories = [
    // L1
    { code: 'GOV', label: '정치/행정',   level: 1, parentCode: null, sortOrder: 1 },
    { code: 'SOC', label: '사회/복지',   level: 1, parentCode: null, sortOrder: 2 },
    { code: 'EDU', label: '교육',         level: 1, parentCode: null, sortOrder: 3 },
    { code: 'HEL', label: '보건/의료',   level: 1, parentCode: null, sortOrder: 4 },
    { code: 'ENV', label: '환경',         level: 1, parentCode: null, sortOrder: 5 },
    { code: 'ANI', label: '동물권',       level: 1, parentCode: null, sortOrder: 6 },
    { code: 'LAB', label: '노동',         level: 1, parentCode: null, sortOrder: 7 },
    { code: 'JUS', label: '사법/인권',   level: 1, parentCode: null, sortOrder: 8 },
    { code: 'TEC', label: '과학/기술',   level: 1, parentCode: null, sortOrder: 9 },
    { code: 'COM', label: '지역사회',     level: 1, parentCode: null, sortOrder: 10 },
    { code: 'MIX', label: '복합이슈',     level: 1, parentCode: null, sortOrder: 11 },
    { code: 'UNC', label: '미분류',       level: 1, parentCode: null, sortOrder: 12 },
    { code: 'REV', label: '검토대기',     level: 1, parentCode: null, sortOrder: 13 },
    // EDU L2
    { code: 'EDU_DIGITAL',        label: '디지털·AI 교육',  level: 2, parentCode: 'EDU', sortOrder: 1 },
    { code: 'EDU_SCHOOL_POLICY',  label: '학교정책',          level: 2, parentCode: 'EDU', sortOrder: 2 },
    { code: 'EDU_EXAM',           label: '입시/평가',          level: 2, parentCode: 'EDU', sortOrder: 3 },
    { code: 'EDU_STUDENT_RIGHTS', label: '학생인권',           level: 2, parentCode: 'EDU', sortOrder: 4 },
    { code: 'EDU_TEACHER',        label: '교사/교육노동',      level: 2, parentCode: 'EDU', sortOrder: 5 },
    { code: 'EDU_FACILITY',       label: '교육환경/시설',      level: 2, parentCode: 'EDU', sortOrder: 6 },
    { code: 'EDU_MEAL',           label: '급식/안전',           level: 2, parentCode: 'EDU', sortOrder: 7 },
    // TEC L2
    { code: 'TEC_PRIVACY',       label: '개인정보',        level: 2, parentCode: 'TEC', sortOrder: 1 },
    { code: 'TEC_PLATFORM',      label: '플랫폼 정책',     level: 2, parentCode: 'TEC', sortOrder: 2 },
    { code: 'TEC_AI',            label: 'AI 윤리',          level: 2, parentCode: 'TEC', sortOrder: 3 },
    { code: 'TEC_ACCESSIBILITY', label: '디지털 접근성',   level: 2, parentCode: 'TEC', sortOrder: 4 },
    { code: 'TEC_ONLINE_SAFETY', label: '온라인 안전',     level: 2, parentCode: 'TEC', sortOrder: 5 },
    { code: 'TEC_ALGORITHM',     label: '알고리즘 공정성', level: 2, parentCode: 'TEC', sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.petitionCategory.upsert({
      where: { code: cat.code },
      update: { label: cat.label },
      create: cat,
    });
  }
  console.log(`✓ ${categories.length}개 카테고리 시드 완료`);

  // ── Admin user ────────────────────────────────────────────────────────────
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
  console.log('✓ 관리자 계정 시드 완료');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
