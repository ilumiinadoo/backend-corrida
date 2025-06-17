import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import mongoose from 'mongoose'

// Define o formato do objeto de coordenada
class Coordenada {
  lat: number
  lng: number
}

@Schema()
export class Route {
  @Prop({ required: true })
  nome: string

  @Prop()
  descricao?: string

  // Partida: [lat, lng]
  @Prop({ type: [Number], required: true })
  partida: number[]

  // Chegada: [lat, lng]
  @Prop({ type: [Number], required: true })
  chegada: number[]

  // Coordenadas do trajeto: array de objetos { lat, lng }
  @Prop({
    type: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],
    required: true,
    _id: false, // ⚠️ impede que cada objeto receba um _id no MongoDB
  })
  coordenadas: Coordenada[]

  @Prop({ required: true })
  distanciaKm: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  groupId: mongoose.Types.ObjectId
}

export type RouteDocument = Route & Document
export const RouteSchema = SchemaFactory.createForClass(Route)
