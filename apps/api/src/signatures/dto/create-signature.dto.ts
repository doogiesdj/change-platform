import { IsString, IsOptional, IsBoolean, MaxLength, IsIn } from 'class-validator';

export class CreateSignatureDto {
  @IsString()
  @MaxLength(100)
  displayName!: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsIn(['10s', '20s', '30s', '40s', '50s', '60s', '70plus', 'unknown'])
  ageBand?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'non_binary', 'prefer_not_to_say'])
  gender?: string;

  @IsBoolean()
  consentToStatistics!: boolean;
}
