export type ActionType =
  | 'law_revision'
  | 'policy_withdrawal'
  | 'punishment_strengthen'
  | 'investigation_request'
  | 'facility_installation'
  | 'budget_allocation'
  | 'system_improvement'
  | 'other';

export const ACTION_KEYWORDS: Record<ActionType, string[]> = {
  law_revision: ['법 개정', '법률 개정', '조례 개정', '법안 발의', '법안 제정'],
  policy_withdrawal: ['정책 철회', '취소', '중단', '폐지', '철폐'],
  punishment_strengthen: ['처벌 강화', '처벌 수위', '형량 강화', '엄벌'],
  investigation_request: ['조사 요청', '수사 촉구', '진상 규명', '감사'],
  facility_installation: ['시설 설치', '설치 요구', '건립', '조성'],
  budget_allocation: ['예산 배정', '예산 확대', '지원금', '지원 확대'],
  system_improvement: ['제도 개선', '정책 개선', '시스템 개선', '개선 요구'],
  other: [],
};
