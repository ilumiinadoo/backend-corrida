import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from './src/groups/group.schema';
import { Route } from './src/routes/route.schema';
import { Accomplishment } from './src/accomplishments/accomplishment.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const groupModel = app.get<Model<Group>>(getModelToken('Group'));
  const routeModel = app.get<Model<Route>>(getModelToken('Route'));
  const accomplishmentModel = app.get<Model<Accomplishment>>(getModelToken('Accomplishment'));

  console.log('🧹 Limpando accomplishments...');
  await accomplishmentModel.deleteMany({});

  const grupos = await groupModel.find().lean();

  const toObjectId = (id: any) => new Types.ObjectId(String(id));

  for (const grupo of grupos) {
    const rotas = await routeModel.find({ groupId: grupo._id }).lean();

    for (const rota of rotas) {
      for (const membroId of grupo.membros as string[]) {
        const tempoHoras = Math.floor(Math.random() * 2);
        const tempoMinutos = Math.floor(Math.random() * 60);
        const tempoSegundos = Math.floor(Math.random() * 60);

        const tempoTotalMin = tempoHoras * 60 + tempoMinutos + tempoSegundos / 60;
        const distanciaKm = rota.distanciaKm || 5;
        const ritmoMedio = parseFloat((tempoTotalMin / distanciaKm).toFixed(2));

        await accomplishmentModel.create({
          usuarioId: toObjectId(membroId),
          grupoId: toObjectId(grupo._id),
          rotaId: toObjectId(rota._id),
          data: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
          tempo: {
            horas: tempoHoras,
            minutos: tempoMinutos,
            segundos: tempoSegundos,
          },
          avaliacao: Math.floor(Math.random() * 5) + 1,
          comentario: `Comentário do usuário sobre a rota ${rota.nome}`,
          ritmoMedio,
        });

        console.log(`✅ Accomplishment criado: Usuário ${membroId} → Rota ${rota.nome}`);
      }
    }
  }

  console.log('✅ Seed de accomplishments finalizado!');
  await app.close();
}

bootstrap();
