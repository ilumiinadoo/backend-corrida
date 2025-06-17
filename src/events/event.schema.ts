import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Group } from '../groups/group.schema';
import { Route } from '../routes/route.schema';

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  location?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  group: Types.ObjectId;

  @Prop({ enum: ['treino', 'corrida', 'outro'], required: true })
  tipo: 'treino' | 'corrida' | 'outro';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: false })
  rotaAssociada?: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['confirmed', 'maybe', 'declined'], default: 'confirmed' },
      },
    ],
    default: [],
  })
  attendees: { user: Types.ObjectId; status: 'confirmed' | 'maybe' | 'declined' }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
export type EventDocument = Event & Document;
