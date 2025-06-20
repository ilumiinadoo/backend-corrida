import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.seeding' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import axios from 'axios';
import { User } from './src/users/user.schema';
import { Activity } from './src/activities/activity.schema';

const ORS_API_KEY = '5b3ce3597851110001cf624801f8288f2e4a4754a0a717d539980f65';

async function getRouteCoordinates(start: [number, number], end: [number, number]) {
  const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

  try {
    const response = await axios.post(
      url,
      { coordinates: [start, end] },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data as any;

    if (!data?.features?.[0]?.geometry) {
      console.error('❌ Resposta inesperada da API ORS:', JSON.stringify(data));
      return [];
    }

    const coords = data.features[0].geometry.coordinates;
    return coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
  } catch (error: any) {
    console.error('❌ Erro ao buscar rota no ORS:', error.response?.data || error.message);
    return [];
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken('User'));
  const activityModel = app.get<Model<Activity>>(getModelToken('Activity'));

  await activityModel.deleteMany({});

  const usuarios = await userModel.find().lean();

  const rotasFixas: [number, number][][] = [
    [[-51.2189, -30.0409], [-51.2157, -30.0350]], // Redenção
    [[-51.2308, -30.0421], [-51.2345, -30.0342]], // Orla do Guaíba
    [[-51.2163, -30.0283], [-51.2205, -30.0321]], // Parcão
  ];

  for (const user of usuarios) {
    let criadas = 0;

    // Tenta criar 2 atividades com rota
    for (let i = 0; i < 2; i++) {
      const rotaEscolhida = rotasFixas[Math.floor(Math.random() * rotasFixas.length)];
      const routeCoords = await getRouteCoordinates(rotaEscolhida[0], rotaEscolhida[1]);

      if (routeCoords.length >= 5) {
        const distanciaKm = parseFloat((Math.random() * 3 + 1).toFixed(2));
        const tempoMinutos = Math.floor(Math.random() * 40) + 20;
        const ritmoMedio = parseFloat((tempoMinutos / distanciaKm).toFixed(2));
        const calorias = Math.floor(Math.random() * 200) + 150;

        await activityModel.create({
          usuarioId: user._id,
          distanciaKm,
          tempoMinutos,
          ritmoMedio,
          calorias,
          data: new Date(),
          coordenadas: routeCoords,
        });

        criadas++;
      } else {
        console.warn(`❌ Atividade com rota pulada para ${user.email}, poucos pontos.`);
      }
    }

    // Cria 1 atividade manual (sem rota)
    const distanciaKm = parseFloat((Math.random() * 3 + 1).toFixed(2));
    const tempoMinutos = Math.floor(Math.random() * 40) + 20;
    const ritmoMedio = parseFloat((tempoMinutos / distanciaKm).toFixed(2));
    const calorias = Math.floor(Math.random() * 200) + 150;

    await activityModel.create({
      usuarioId: user._id,
      distanciaKm,
      tempoMinutos,
      ritmoMedio,
      calorias,
      data: new Date(),
      coordenadas: [],
    });

    console.log(`✅ Usuário ${user.email} teve ${criadas} atividades com rota + 1 manual.`);
  }

  console.log('✅ Seed de atividades finalizado.');
  await app.close();
  await mongoose.disconnect();
}

bootstrap();
