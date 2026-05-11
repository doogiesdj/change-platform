import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreatePetitionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  decisionMakerNameRaw?: string;

  @IsOptional()
  @IsString({ each: true })
  hashtags?: string[];
}
