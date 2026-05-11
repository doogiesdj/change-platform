import { IsString, IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'petition_creator', 'moderator', 'admin'])
  role!: string;
}
