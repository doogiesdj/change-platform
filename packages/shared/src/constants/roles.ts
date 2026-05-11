import type { UserRole } from '../types/user';

export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  PETITION_CREATOR: 'petition_creator',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const satisfies Record<string, UserRole>;

export const OPERATOR_ROLES: UserRole[] = ['moderator', 'admin'];
export const CREATOR_ROLES: UserRole[] = ['petition_creator', 'moderator', 'admin'];
