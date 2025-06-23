import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Group } from '../groups/group.schema';
import { Route } from '../routes/route.schema';
import { User } from '../users/user.schema';

export type EventDocument = Event & Document;

@Schema()
export class Event {
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Group.name, required: true })
  group: Types.ObjectId;

  @Prop({ enum: ['treino', 'corrida', 'outro'], required: true })
  tipo: 'treino' | 'corrida' | 'outro';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Route.name })
  rotaAssociada?: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
        status: {
          type: String,
          enum: ['confirmed', 'maybe', 'declined'],
          default: 'confirmed',
        },
      },
    ],
    default: [],
  })
  attendees: { user: Types.ObjectId; status: 'confirmed' | 'maybe' | 'declined' }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
