import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

export class DecideReviewDto {
  @IsString()
  @IsIn(['approve', 'reject'])
  decision!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
