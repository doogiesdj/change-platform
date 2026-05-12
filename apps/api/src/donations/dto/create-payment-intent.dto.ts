import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsIn,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @IsIn(['petition', 'platform'])
  targetType!: 'petition' | 'platform';

  @ValidateIf((o: CreatePaymentIntentDto) => o.targetType === 'petition')
  @IsString()
  @IsNotEmpty()
  petitionId?: string;

  @IsString()
  @IsIn(['one_time', 'recurring'])
  donationType!: 'one_time' | 'recurring';

  @IsNumber()
  @Min(1000)
  amount!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  donorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  idempotencyKey?: string;
}
