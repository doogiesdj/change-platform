import { IsOptional, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ConfirmPaymentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentKey?: string;

  @IsNumber()
  @Min(1000)
  amount!: number;
}
