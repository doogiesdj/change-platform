import { IsString, IsOptional, IsBoolean, MinLength, MaxLength, IsIn } from 'class-validator';

const AGE_BANDS = ['under_19', '20_29', '30_39', '40_49', '50_59', '60_plus', 'unknown'] as const;
const GENDERS = ['male', 'female', 'other', 'unknown'] as const;

export class CreateSignatureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  regionCode?: string;

  @IsOptional()
  @IsIn(AGE_BANDS)
  ageBand?: string;

  @IsOptional()
  @IsIn(GENDERS)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  comment?: string;

  @IsBoolean()
  consentToStatistics!: boolean;
}
