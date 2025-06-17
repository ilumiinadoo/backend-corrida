import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  idade?: number;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsEnum(['iniciante', 'intermediário', 'avançado'])
  nivelExperiencia?: string;

  @IsOptional()
  @IsEnum(['pista', 'trilha', 'rua'])
  estiloCorrida?: string;
}
