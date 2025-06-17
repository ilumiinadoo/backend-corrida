import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Accomplishment extends Document {
  @Prop({ required: true })
  rotaId: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  grupoId: Types.ObjectId;

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  data: Date;

  @Prop({ required: true, type: Object })
  tempo: {
    horas: number;
    minutos: number;
    segundos: number;
  };

  @Prop({ required: true })
  ritmoMedio: number;

  @Prop({ required: true, min: 1, max: 5 })
  avaliacao: number;

  @Prop({ required: true })
  comentario: string;
}

export const AccomplishmentSchema = SchemaFactory.createForClass(Accomplishment);
