import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreatePetitionUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}
