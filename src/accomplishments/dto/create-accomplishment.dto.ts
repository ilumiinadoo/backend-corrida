import { IsDateString, IsInt, IsString, Min, Max, Length } from 'class-validator';

export class CreateAccomplishmentDto {
  @IsString()
  rotaId: string;

  @IsDateString()
  data: string;

  @IsInt() @Min(0)
  horas: number;

  @IsInt() @Min(0) @Max(59)
  minutos: number;

  @IsInt() @Min(0) @Max(59)
  segundos: number;

  @IsInt() @Min(1) @Max(5)
  avaliacao: number;

  @IsString() @Length(3, 500)
  comentario: string;
}
