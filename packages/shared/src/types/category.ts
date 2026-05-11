export type CategoryLevel = 1 | 2 | 3;

export interface Category {
  code: string;
  label: string;
  level: CategoryLevel;
  parentCode: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}
