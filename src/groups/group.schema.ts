import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class Group extends Document {
  @Prop({ required: true })
  nome: string

  @Prop()
  descricao: string

  @Prop({ required: true })
  criadorId: string

  @Prop({ type: [String], default: [] })
  administradores: string[]

  @Prop({ type: [String], default: [] })
  membros: string[]

  @Prop({ type: [String], default: [] })
  pendentes: string[]
}

export type GroupDocument = Group & Document
export const GroupSchema = SchemaFactory.createForClass(Group)
