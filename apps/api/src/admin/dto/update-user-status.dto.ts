import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['active', 'suspended', 'deleted'])
  status!: 'active' | 'suspended' | 'deleted';
}
