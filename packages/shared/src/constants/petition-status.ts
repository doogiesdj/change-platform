import type { PetitionStatus } from '../types/petition';

export const PETITION_STATUS = {
  REVIEW: 'review',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  CLOSED: 'closed',
  ACHIEVED: 'achieved',
} as const satisfies Record<string, PetitionStatus>;

export const PUBLIC_PETITION_STATUSES: PetitionStatus[] = ['published', 'closed', 'achieved'];
