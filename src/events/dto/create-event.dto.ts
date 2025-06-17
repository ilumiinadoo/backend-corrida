import { IsString, IsOptional, IsDateString, IsEnum, IsMongoId } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsMongoId()
  group: string;

  @IsEnum(['treino', 'corrida', 'outro'])
  tipo: 'treino' | 'corrida' | 'outro';

  @IsOptional()
  @IsMongoId()
  rotaAssociada?: string;
}
