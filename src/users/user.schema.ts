import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  senha?: string;

  @Prop()
  googleId?: string;

  @Prop()
  foto: string;

  @Prop()
  idade?: number;

  @Prop({ enum: ['iniciante', 'intermediário', 'avançado']})
  nivelExperiencia?: string;

  @Prop({ enum: ['pista', 'trilha', 'rua']})
  estiloCorrida?: string;
  
  @Prop({
    type: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
    },
    default: {},
  })
  redesSociais: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };

  @Prop({ default: Date.now })
  criadoEm: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
