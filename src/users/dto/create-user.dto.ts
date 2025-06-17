import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsEmailUnico } from '../validators/is-email-unico.validator';

class RedesSociaisDto {
  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  twitter?: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  @IsEmailUnico({ message: 'Este e-mail já está cadastrado.' })
  email: string;

  @IsOptional()
  @IsString()
  senha?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsString()
  @IsNotEmpty()
  foto: string;

  @IsInt()
  @Min(5)
  @Max(100)
  idade: number;

  @IsEnum(['iniciante', 'intermediário', 'avançado'])
  nivelExperiencia: string;

  @IsEnum(['pista', 'trilha', 'rua'])
  estiloCorrida: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RedesSociaisDto)
  redesSociais?: RedesSociaisDto;
}
