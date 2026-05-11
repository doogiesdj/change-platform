import type { Category } from '@change/shared';

export const CATEGORIES: Category[] = [
  { code: 'GOV', label: '정부·정치', level: 1, parentCode: null, sortOrder: 1, isActive: true },
  { code: 'SOC', label: '사회·인권', level: 1, parentCode: null, sortOrder: 2, isActive: true },
  { code: 'EDU', label: '교육', level: 1, parentCode: null, sortOrder: 3, isActive: true },
  { code: 'HEL', label: '보건·복지', level: 1, parentCode: null, sortOrder: 4, isActive: true },
  { code: 'ENV', label: '환경·기후', level: 1, parentCode: null, sortOrder: 5, isActive: true },
  { code: 'ANI', label: '동물', level: 1, parentCode: null, sortOrder: 6, isActive: true },
  { code: 'LAB', label: '노동·경제·기업', level: 1, parentCode: null, sortOrder: 7, isActive: true },
  { code: 'JUS', label: '사법·안전', level: 1, parentCode: null, sortOrder: 8, isActive: true },
  { code: 'TEC', label: '기술·디지털', level: 1, parentCode: null, sortOrder: 9, isActive: true },
  { code: 'COM', label: '지역사회·생활', level: 1, parentCode: null, sortOrder: 10, isActive: true },
  { code: 'MIX', label: '복합이슈', level: 1, parentCode: null, sortOrder: 11, isActive: true },
  { code: 'UNC', label: '미분류', level: 1, parentCode: null, sortOrder: 12, isActive: true },
  { code: 'REV', label: '검토대기', level: 1, parentCode: null, sortOrder: 13, isActive: true },

  // GOV 중분류
  { code: 'GOV_CENTRAL', label: '중앙정부', level: 2, parentCode: 'GOV', sortOrder: 1, isActive: true },
  { code: 'GOV_LOCAL', label: '지방정부', level: 2, parentCode: 'GOV', sortOrder: 2, isActive: true },
  { code: 'GOV_LEGISLATION', label: '입법/법률개정', level: 2, parentCode: 'GOV', sortOrder: 3, isActive: true },
  { code: 'GOV_ADMIN', label: '행정/규제', level: 2, parentCode: 'GOV', sortOrder: 4, isActive: true },
  { code: 'GOV_ELECTION', label: '정치참여/선거', level: 2, parentCode: 'GOV', sortOrder: 5, isActive: true },

  // EDU 중분류
  { code: 'EDU_SCHOOL_POLICY', label: '학교정책', level: 2, parentCode: 'EDU', sortOrder: 1, isActive: true },
  { code: 'EDU_EXAM', label: '입시/평가', level: 2, parentCode: 'EDU', sortOrder: 2, isActive: true },
  { code: 'EDU_STUDENT_RIGHTS', label: '학생인권', level: 2, parentCode: 'EDU', sortOrder: 3, isActive: true },
  { code: 'EDU_TEACHER', label: '교사/교육노동', level: 2, parentCode: 'EDU', sortOrder: 4, isActive: true },
  { code: 'EDU_FACILITY', label: '교육환경/시설', level: 2, parentCode: 'EDU', sortOrder: 5, isActive: true },

  // EDU 소분류
  { code: 'EDU_SCHOOL_POLICY_MEAL_SAFETY', label: '급식안전', level: 3, parentCode: 'EDU_SCHOOL_POLICY', sortOrder: 1, isActive: true },
  { code: 'EDU_EXAM_REFORM', label: '입시제도 개선', level: 3, parentCode: 'EDU_EXAM', sortOrder: 1, isActive: true },
];
