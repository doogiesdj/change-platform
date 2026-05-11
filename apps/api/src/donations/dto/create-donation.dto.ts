import { IsString, IsNumber, IsOptional, IsBoolean, IsIn, Min } from 'class-validator';

export class CreateDonationDto {
  @IsString()
  targetType!: 'petition' | 'platform';

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsNumber()
  @Min(1000)
  amount!: number;

  @IsString()
  @IsIn(['one_time', 'recurring'])
  donationType!: string;

  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'yearly'])
  billingCycle?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  message?: string;
}
