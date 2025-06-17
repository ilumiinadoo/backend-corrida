import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoordenadaDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateActivityDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  distanciaKm: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  tempoMinutos: number;

  @IsNotEmpty()
  @IsDateString()
  data: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  elevacao?: number;

  @IsOptional()
  @IsString()
  pontoInicio?: string;

  @IsOptional()
  @IsString()
  pontoFim?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordenadaDto)
  coordenadas?: CoordenadaDto[];
}
