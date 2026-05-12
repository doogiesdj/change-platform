import { IsString, IsIn } from 'class-validator';
import type { UserRole } from '@change/shared';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'petition_creator', 'moderator', 'admin'])
  role!: UserRole;
}
