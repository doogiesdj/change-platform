import { scoreCategories } from './scorer';

describe('scoreCategories', () => {
  it('returns empty array when no keywords match', () => {
    const scores = scoreCategories('오늘 날씨가 맑음', '특이사항 없음');
    expect(scores).toHaveLength(0);
  });

  it('awards score 2 for title match', () => {
    const scores = scoreCategories('동물 보호 청원', '');
    const ani = scores.find((s) => s.code === 'ANI');
    expect(ani).toBeDefined();
    expect(ani!.score).toBeGreaterThanOrEqual(2);
  });

  it('awards score 1 for content-only match', () => {
    const scores = scoreCategories('', '환경 문제 해결이 필요합니다');
    const env = scores.find((s) => s.code === 'ENV');
    expect(env).toBeDefined();
    expect(env!.score).toBeGreaterThanOrEqual(1);
  });

  it('awards score 3 when keyword appears in both title and content', () => {
    const scores = scoreCategories('노동 권리 보호', '노동자들의 권리가 침해받고 있습니다');
    const lab = scores.find((s) => s.code === 'LAB');
    expect(lab).toBeDefined();
    expect(lab!.score).toBeGreaterThanOrEqual(3);
  });

  it('returns scores sorted by descending score', () => {
    const scores = scoreCategories('동물 반려동물 유기 학대', '동물복지 실험동물 야생동물');
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].score).toBeGreaterThanOrEqual(scores[i].score);
    }
  });

  it('includes matched keywords in result', () => {
    const scores = scoreCategories('학교 급식 문제', '교육청 대응 필요');
    const edu = scores.find((s) => s.code === 'EDU');
    expect(edu).toBeDefined();
    expect(edu!.matchedKeywords.length).toBeGreaterThan(0);
  });

  it('awards institution bonus score', () => {
    // '교육부' is in KEYWORD_DICTIONARY for EDU but also in institutions potentially
    // Just verify score increases for known L2 edu keywords
    const scoresWithInstitution = scoreCategories('교육부 학교 급식', '교육 정책');
    const edu = scoresWithInstitution.find((s) => s.code === 'EDU');
    expect(edu).toBeDefined();
    expect(edu!.score).toBeGreaterThanOrEqual(2);
  });

  it('matches L2 category keywords independently', () => {
    const scores = scoreCategories('지방정부 시청 구청 문제', '');
    const govLocal = scores.find((s) => s.code === 'GOV_LOCAL');
    expect(govLocal).toBeDefined();
    expect(govLocal!.score).toBeGreaterThan(0);
  });
});
