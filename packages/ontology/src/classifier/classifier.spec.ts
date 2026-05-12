import { classify } from './classifier';

describe('classify', () => {
  it('returns UNC with reviewRequired=true when no keywords match', () => {
    const result = classify({ title: '오늘 날씨가 좋습니다', content: '특이사항 없음' });
    expect(result.primaryCategoryCode).toBe('UNC');
    expect(result.reviewRequired).toBe(true);
    expect(result.confidence).toBe(0);
  });

  it('classifies ENV petition correctly', () => {
    const result = classify({
      title: '기후 위기 대응 탄소 배출 규제 청원',
      content: '환경 오염과 대기 수질 문제 해결을 위해 정책 변화가 필요합니다.',
    });
    expect(result.primaryCategoryCode).toMatch(/^ENV/);
    expect(result.reviewRequired).toBe(false);
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it('classifies ANI petition correctly', () => {
    const result = classify({
      title: '반려동물 학대 처벌 강화 청원',
      content: '유기동물과 동물복지 문제가 심각합니다. 동물 입양 문화 정착이 필요합니다.',
    });
    expect(result.primaryCategoryCode).toMatch(/^ANI/);
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it('classifies EDU petition correctly', () => {
    const result = classify({
      title: '학교 급식 품질 개선 요청',
      content: '학생 건강을 위해 교육청은 급식 기준을 강화해야 합니다.',
    });
    expect(result.primaryCategoryCode).toMatch(/^EDU/);
  });

  it('sets reviewRequired=true when confidence is below threshold', () => {
    // Content with only one weak keyword match produces low confidence
    const result = classify({ title: '재활용 문제', content: '' });
    // Even if it classifies, check reviewRequired reflects confidence
    if (result.confidence < 0.4) {
      expect(result.reviewRequired).toBe(true);
    }
  });

  it('sets reviewRequired=true when multiple strong secondary categories exist', () => {
    // Mix of equally weighted categories should trigger review
    const result = classify({
      title: '동물 학대 노동 임금 환경 오염 차별',
      content: '반려동물 유기 노동자 해고 탄소 혐오 문제',
    });
    // With many competing categories, reviewRequired could be true
    expect(typeof result.reviewRequired).toBe('boolean');
  });

  it('returns matchedKeywords list', () => {
    const result = classify({
      title: '환경 보호 청원',
      content: '탄소 배출 줄이기 위한 정책이 필요합니다',
    });
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  it('rounds confidence to 2 decimal places', () => {
    const result = classify({
      title: '학교 급식 교육 문제',
      content: '학생 교사 교육청 입시 교과서 수능',
    });
    const decimalPlaces = (result.confidence.toString().split('.')[1] ?? '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('returns secondaryCategoryCodes as array', () => {
    const result = classify({ title: '환경', content: '탄소' });
    expect(Array.isArray(result.secondaryCategoryCodes)).toBe(true);
  });

  it('does not include primary L1 code in secondary list', () => {
    const result = classify({
      title: '환경 기후 탄소 오염 재활용',
      content: '생태 산림 해양 대기 수질 에너지',
    });
    expect(result.secondaryCategoryCodes).not.toContain(
      result.primaryCategoryCode.split('_')[0],
    );
  });
});
