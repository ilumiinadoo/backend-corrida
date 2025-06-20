import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.seeding' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import axios from 'axios';
import { Group } from './src/groups/group.schema';
import { Route } from './src/routes/route.schema';

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

  const groupModel = app.get<Model<Group>>(getModelToken('Group'));
  const routeModel = app.get<Model<Route>>(getModelToken('Route'));

  await routeModel.deleteMany({});

  const grupos = await groupModel.find().lean();

  const pontosPorGrupo: [number, number][][][] = [
    // Grupo 1 - Redenção
    [
      [[-51.2189, -30.0409], [-51.2157, -30.0350]],
      [[-51.2212, -30.0372], [-51.2178, -30.0398]],
      [[-51.2170, -30.0410], [-51.2160, -30.0360]],
    ],
    // Grupo 2 - Orla
    [
      [[-51.2308, -30.0421], [-51.2345, -30.0342]],
      [[-51.2330, -30.0400], [-51.2360, -30.0370]],
      [[-51.2310, -30.0410], [-51.2320, -30.0360]],
    ],
    // Grupo 3 - Parcão
    [
      [[-51.2163, -30.0283], [-51.2205, -30.0321]],
      [[-51.2170, -30.0300], [-51.2190, -30.0310]],
      [[-51.2180, -30.0290], [-51.2210, -30.0300]],
    ],
  ];

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    const rotasDoGrupo = pontosPorGrupo[i];

    for (let r = 0; r < rotasDoGrupo.length; r++) {
      const [start, end] = rotasDoGrupo[r];
      const coords = await getRouteCoordinates(start, end);

      if (coords.length >= 5) {
        await routeModel.create({
          nome: `Rota ${r + 1} - ${grupo.nome}`,
          descricao: `Percurso ${r + 1} para o grupo ${grupo.nome}`,
          groupId: new Types.ObjectId(grupo._id as string),
          criadoPor: new Types.ObjectId(grupo.administradores[0] as string),
          coordenadas: coords,
          partida: [coords[0].lat, coords[0].lng],
          chegada: [coords[coords.length - 1].lat, coords[coords.length - 1].lng],
          distanciaKm: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        });

        console.log(`✅ Rota ${r + 1} criada para o grupo ${grupo.nome}`);
      } else {
        console.warn(`❌ Rota ${r + 1} do grupo ${grupo.nome} teve poucos pontos e foi ignorada.`);
      }
    }
  }

  console.log('✅ Seed de rotas finalizado.');
  await app.close();
  await mongoose.disconnect();
}

bootstrap();
