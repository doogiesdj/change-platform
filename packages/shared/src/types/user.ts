export type UserRole = 'guest' | 'user' | 'petition_creator' | 'moderator' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicProfile {
  id: string;
  displayName: string;
}
