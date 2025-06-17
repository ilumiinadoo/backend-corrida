import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  usuarioId: string;

  @Prop({ required: true })
  distanciaKm: number;

  @Prop({ required: true })
  tempoMinutos: number;

  @Prop({ required: true })
  ritmoMedio: number; // min/km, calculado automaticamente no service

  @Prop({ required: true })
  calorias: number; // calculado automaticamente (exemplo: distancia * 60 kcal/km como valor médio)

  @Prop()
  elevacao?: number; // Opcional

  @Prop({ type: [{ lat: Number, lng: Number }] })
  coordenadas?: { lat: number; lng: number }[]; // Opcional, só se for com mapa

  @Prop()
  pontoInicio?: string; // Nome ou endereço opcional

  @Prop()
  pontoFim?: string; // Nome ou endereço opcional

  @Prop({ required: true })
  data: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
