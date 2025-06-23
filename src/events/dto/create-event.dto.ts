import { IsString, IsOptional, IsDateString, IsEnum, IsMongoId } from 'class-validator';

export enum EventType {
  TREINO = 'treino',
  CORRIDA = 'corrida',
  OUTRO = 'outro',
}

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

  @IsEnum(EventType)
  tipo: EventType;

  @IsOptional()
  @IsMongoId()
  rotaAssociada?: string;
}
