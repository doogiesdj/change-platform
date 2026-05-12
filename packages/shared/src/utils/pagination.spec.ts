import { buildPaginationMeta, buildPaginationQuery } from './pagination';

describe('buildPaginationMeta', () => {
  it('calculates totalPages correctly', () => {
    const meta = buildPaginationMeta(100, 1, 20);
    expect(meta).toEqual({ page: 1, pageSize: 20, totalItems: 100, totalPages: 5 });
  });

  it('rounds up totalPages when items do not divide evenly', () => {
    const meta = buildPaginationMeta(21, 1, 20);
    expect(meta.totalPages).toBe(2);
  });

  it('returns totalPages of 1 when totalItems equals pageSize', () => {
    const meta = buildPaginationMeta(20, 1, 20);
    expect(meta.totalPages).toBe(1);
  });

  it('returns totalPages of 0 when there are no items', () => {
    const meta = buildPaginationMeta(0, 1, 20);
    expect(meta.totalPages).toBe(0);
  });

  it('preserves page and pageSize values', () => {
    const meta = buildPaginationMeta(50, 3, 10);
    expect(meta.page).toBe(3);
    expect(meta.pageSize).toBe(10);
    expect(meta.totalItems).toBe(50);
  });
});

describe('buildPaginationQuery', () => {
  it('returns skip=0 for page 1', () => {
    const query = buildPaginationQuery(1, 20);
    expect(query).toEqual({ skip: 0, take: 20 });
  });

  it('returns correct skip for page 2', () => {
    const query = buildPaginationQuery(2, 20);
    expect(query).toEqual({ skip: 20, take: 20 });
  });

  it('returns correct skip for page 3', () => {
    const query = buildPaginationQuery(3, 10);
    expect(query).toEqual({ skip: 20, take: 10 });
  });

  it('sets take to pageSize', () => {
    const query = buildPaginationQuery(1, 50);
    expect(query.take).toBe(50);
  });
});
