import { IsString, IsIn, IsOptional, IsNotEmpty, MaxLength, ValidateIf } from 'class-validator';

export class DecideReviewDto {
  @IsString()
  @IsIn(['approve', 'reject', 'reclassify'])
  decision!: 'approve' | 'reject' | 'reclassify';

  @ValidateIf((o: DecideReviewDto) => o.decision === 'reclassify')
  @IsString()
  @IsNotEmpty()
  newCategoryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
