import type { Category } from '@change/shared';

export const CATEGORIES: Category[] = [
  // L1
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

  // GOV L2
  { code: 'GOV_CENTRAL', label: '중앙정부', level: 2, parentCode: 'GOV', sortOrder: 1, isActive: true },
  { code: 'GOV_LOCAL', label: '지방정부', level: 2, parentCode: 'GOV', sortOrder: 2, isActive: true },
  { code: 'GOV_LEGISLATION', label: '입법/법률개정', level: 2, parentCode: 'GOV', sortOrder: 3, isActive: true },
  { code: 'GOV_ADMIN', label: '행정/규제', level: 2, parentCode: 'GOV', sortOrder: 4, isActive: true },
  { code: 'GOV_ELECTION', label: '정치참여/선거', level: 2, parentCode: 'GOV', sortOrder: 5, isActive: true },
  { code: 'GOV_PUBLIC_INST', label: '공공기관 운영', level: 2, parentCode: 'GOV', sortOrder: 6, isActive: true },

  // SOC L2
  { code: 'SOC_DISCRIMINATION', label: '차별/혐오', level: 2, parentCode: 'SOC', sortOrder: 1, isActive: true },
  { code: 'SOC_GENDER', label: '여성권리', level: 2, parentCode: 'SOC', sortOrder: 2, isActive: true },
  { code: 'SOC_DISABILITY', label: '장애권리', level: 2, parentCode: 'SOC', sortOrder: 3, isActive: true },
  { code: 'SOC_CHILD', label: '아동/청소년 권리', level: 2, parentCode: 'SOC', sortOrder: 4, isActive: true },
  { code: 'SOC_MIGRANT', label: '이주민/난민', level: 2, parentCode: 'SOC', sortOrder: 5, isActive: true },
  { code: 'SOC_LGBTQ', label: 'LGBTQ+', level: 2, parentCode: 'SOC', sortOrder: 6, isActive: true },
  { code: 'SOC_RIGHTS', label: '기본권/표현의 자유', level: 2, parentCode: 'SOC', sortOrder: 7, isActive: true },

  // EDU L2
  { code: 'EDU_DIGITAL', label: '디지털·AI 교육', level: 2, parentCode: 'EDU', sortOrder: 1, isActive: true },
  { code: 'EDU_SCHOOL_POLICY', label: '학교정책', level: 2, parentCode: 'EDU', sortOrder: 2, isActive: true },
  { code: 'EDU_EXAM', label: '입시/평가', level: 2, parentCode: 'EDU', sortOrder: 3, isActive: true },
  { code: 'EDU_STUDENT_RIGHTS', label: '학생인권', level: 2, parentCode: 'EDU', sortOrder: 4, isActive: true },
  { code: 'EDU_TEACHER', label: '교사/교육노동', level: 2, parentCode: 'EDU', sortOrder: 5, isActive: true },
  { code: 'EDU_FACILITY', label: '교육환경/시설', level: 2, parentCode: 'EDU', sortOrder: 6, isActive: true },
  { code: 'EDU_MEAL', label: '급식/안전', level: 2, parentCode: 'EDU', sortOrder: 7, isActive: true },

  // HEL L2
  { code: 'HEL_PUBLIC_HEALTH', label: '공공보건', level: 2, parentCode: 'HEL', sortOrder: 1, isActive: true },
  { code: 'HEL_MEDICAL', label: '의료접근성', level: 2, parentCode: 'HEL', sortOrder: 2, isActive: true },
  { code: 'HEL_MENTAL', label: '정신건강', level: 2, parentCode: 'HEL', sortOrder: 3, isActive: true },
  { code: 'HEL_CHILD_WELFARE', label: '아동복지', level: 2, parentCode: 'HEL', sortOrder: 4, isActive: true },
  { code: 'HEL_ELDERLY', label: '노인복지', level: 2, parentCode: 'HEL', sortOrder: 5, isActive: true },
  { code: 'HEL_DISABILITY_WELFARE', label: '장애복지', level: 2, parentCode: 'HEL', sortOrder: 6, isActive: true },
  { code: 'HEL_SOCIAL_SECURITY', label: '사회보장/복지제도', level: 2, parentCode: 'HEL', sortOrder: 7, isActive: true },

  // ENV L2
  { code: 'ENV_CLIMATE', label: '기후변화', level: 2, parentCode: 'ENV', sortOrder: 1, isActive: true },
  { code: 'ENV_POLLUTION', label: '오염/폐기물', level: 2, parentCode: 'ENV', sortOrder: 2, isActive: true },
  { code: 'ENV_DEVELOPMENT', label: '개발사업 반대', level: 2, parentCode: 'ENV', sortOrder: 3, isActive: true },
  { code: 'ENV_ECOLOGY', label: '생태/보전', level: 2, parentCode: 'ENV', sortOrder: 4, isActive: true },
  { code: 'ENV_ENERGY', label: '에너지 전환', level: 2, parentCode: 'ENV', sortOrder: 5, isActive: true },
  { code: 'ENV_RECYCLING', label: '재활용/순환경제', level: 2, parentCode: 'ENV', sortOrder: 6, isActive: true },

  // ANI L2
  { code: 'ANI_ABUSE', label: '동물학대', level: 2, parentCode: 'ANI', sortOrder: 1, isActive: true },
  { code: 'ANI_PET', label: '반려동물 정책', level: 2, parentCode: 'ANI', sortOrder: 2, isActive: true },
  { code: 'ANI_WILD', label: '야생동물 보호', level: 2, parentCode: 'ANI', sortOrder: 3, isActive: true },
  { code: 'ANI_FARM', label: '축산/실험동물', level: 2, parentCode: 'ANI', sortOrder: 4, isActive: true },
  { code: 'ANI_LEGISLATION', label: '동물복지 입법', level: 2, parentCode: 'ANI', sortOrder: 5, isActive: true },

  // LAB L2
  { code: 'LAB_RIGHTS', label: '노동권', level: 2, parentCode: 'LAB', sortOrder: 1, isActive: true },
  { code: 'LAB_WAGE', label: '임금/고용', level: 2, parentCode: 'LAB', sortOrder: 2, isActive: true },
  { code: 'LAB_CONSUMER', label: '소비자보호', level: 2, parentCode: 'LAB', sortOrder: 3, isActive: true },
  { code: 'LAB_CORPORATE', label: '기업책임', level: 2, parentCode: 'LAB', sortOrder: 4, isActive: true },
  { code: 'LAB_PLATFORM', label: '플랫폼노동', level: 2, parentCode: 'LAB', sortOrder: 5, isActive: true },
  { code: 'LAB_SMALL_BIZ', label: '소상공인/자영업', level: 2, parentCode: 'LAB', sortOrder: 6, isActive: true },

  // JUS L2
  { code: 'JUS_INVESTIGATION', label: '수사/재판', level: 2, parentCode: 'JUS', sortOrder: 1, isActive: true },
  { code: 'JUS_VICTIM', label: '피해자 보호', level: 2, parentCode: 'JUS', sortOrder: 2, isActive: true },
  { code: 'JUS_CRIMINAL_POLICY', label: '형사정책', level: 2, parentCode: 'JUS', sortOrder: 3, isActive: true },
  { code: 'JUS_DISASTER', label: '재난/위기 대응', level: 2, parentCode: 'JUS', sortOrder: 4, isActive: true },
  { code: 'JUS_PUBLIC_SAFETY', label: '공공안전', level: 2, parentCode: 'JUS', sortOrder: 5, isActive: true },
  { code: 'JUS_POLICE', label: '경찰/행정 책임', level: 2, parentCode: 'JUS', sortOrder: 6, isActive: true },

  // TEC L2
  { code: 'TEC_PRIVACY', label: '개인정보', level: 2, parentCode: 'TEC', sortOrder: 1, isActive: true },
  { code: 'TEC_PLATFORM', label: '플랫폼 정책', level: 2, parentCode: 'TEC', sortOrder: 2, isActive: true },
  { code: 'TEC_AI', label: 'AI 윤리', level: 2, parentCode: 'TEC', sortOrder: 3, isActive: true },
  { code: 'TEC_ACCESSIBILITY', label: '디지털 접근성', level: 2, parentCode: 'TEC', sortOrder: 4, isActive: true },
  { code: 'TEC_ONLINE_SAFETY', label: '온라인 안전', level: 2, parentCode: 'TEC', sortOrder: 5, isActive: true },
  { code: 'TEC_ALGORITHM', label: '알고리즘 공정성', level: 2, parentCode: 'TEC', sortOrder: 6, isActive: true },

  // COM L2
  { code: 'COM_TRANSPORT', label: '교통', level: 2, parentCode: 'COM', sortOrder: 1, isActive: true },
  { code: 'COM_HOUSING', label: '주거', level: 2, parentCode: 'COM', sortOrder: 2, isActive: true },
  { code: 'COM_URBAN', label: '도시계획', level: 2, parentCode: 'COM', sortOrder: 3, isActive: true },
  { code: 'COM_CULTURE', label: '문화/체육', level: 2, parentCode: 'COM', sortOrder: 4, isActive: true },
  { code: 'COM_FACILITY', label: '지역 편의시설', level: 2, parentCode: 'COM', sortOrder: 5, isActive: true },
  { code: 'COM_SAFETY', label: '생활안전', level: 2, parentCode: 'COM', sortOrder: 6, isActive: true },

  // L3 (key nodes)
  { code: 'EDU_SCHOOL_POLICY_MEAL_SAFETY', label: '급식안전', level: 3, parentCode: 'EDU_SCHOOL_POLICY', sortOrder: 1, isActive: true },
  { code: 'EDU_EXAM_REFORM', label: '입시제도 개선', level: 3, parentCode: 'EDU_EXAM', sortOrder: 1, isActive: true },
  { code: 'EDU_MEAL_QUALITY', label: '급식 품질', level: 3, parentCode: 'EDU_MEAL', sortOrder: 1, isActive: true },
  { code: 'EDU_MEAL_ALLERGY', label: '알레르기 표시', level: 3, parentCode: 'EDU_MEAL', sortOrder: 2, isActive: true },
  { code: 'ANI_PET_STRAY', label: '유기동물 보호', level: 3, parentCode: 'ANI_PET', sortOrder: 1, isActive: true },
  { code: 'ANI_PET_BREEDING', label: '번식장 규제', level: 3, parentCode: 'ANI_PET', sortOrder: 2, isActive: true },
  { code: 'ENV_POLLUTION_AIR', label: '대기오염 대응', level: 3, parentCode: 'ENV_POLLUTION', sortOrder: 1, isActive: true },
  { code: 'ENV_POLLUTION_WATER', label: '수질오염 대응', level: 3, parentCode: 'ENV_POLLUTION', sortOrder: 2, isActive: true },
  { code: 'JUS_INVESTIGATION_REINVESTIGATION', label: '재수사 요구', level: 3, parentCode: 'JUS_INVESTIGATION', sortOrder: 1, isActive: true },
  { code: 'GOV_LEGISLATION_LAW_REVISION', label: '법률 개정 요구', level: 3, parentCode: 'GOV_LEGISLATION', sortOrder: 1, isActive: true },
];
