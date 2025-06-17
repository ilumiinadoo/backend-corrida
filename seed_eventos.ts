import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from './src/groups/group.schema';
import { Route } from './src/routes/route.schema';
import { Event } from './src/events/event.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const groupModel = app.get<Model<Group>>(getModelToken('Group'));
  const routeModel = app.get<Model<Route>>(getModelToken('Route'));
  const eventModel = app.get<Model<Event>>(getModelToken('Event'));

  console.log('🧹 Limpando collection de eventos...');
  await eventModel.deleteMany({});

  const grupos = await groupModel.find();
  const statusPossiveis: ('confirmed' | 'maybe' | 'declined')[] = ['confirmed', 'maybe', 'declined'];
  const nomesEventos = [
    'Treino Especial',
    'Longão de Sábado',
    'Desafio 5k',
    'Corrida do Bairro',
    'Encontro de Confraternização',
    'Treino Técnico',
    'Desafio Noturno',
    'Treino de Subida',
    'Corrida Solidária',
    'Treino Intervalado',
  ];

  for (const grupo of grupos) {
    const rotasDoGrupo = await routeModel.find({ groupId: grupo._id });

    for (let i = 0; i < 5; i++) {
      const usarRota = i < 3 && rotasDoGrupo.length > 0;
      const rotaEscolhida = usarRota
        ? rotasDoGrupo[Math.floor(Math.random() * rotasDoGrupo.length)]
        : null;

      const startDate = new Date(2025, 5 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 12) + 8, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2);

      const attendees = grupo.membros.map((membroId) => ({
        user: new Types.ObjectId(membroId),
        status: statusPossiveis[Math.floor(Math.random() * statusPossiveis.length)],
      }));

      await eventModel.create({
        group: grupo._id,
        createdBy: grupo.administradores[0],
        title: `${nomesEventos[Math.floor(Math.random() * nomesEventos.length)]} - ${grupo.nome}`,
        description: 'Evento de corrida criado automaticamente via seed.',
        startDate,
        endDate,
        location: `Local fictício em ${grupo.nome}`,
        tipo: rotaEscolhida ? 'corrida' : 'outro',
        rotaAssociada: rotaEscolhida ? rotaEscolhida._id : undefined,
        attendees,
      });

      console.log(`✅ Evento criado no grupo ${grupo.nome} ${rotaEscolhida ? `(com rota)` : `(sem rota)`}`);
    }
  }

  console.log('✅ Seed de eventos finalizado!');
  await app.close();
}

bootstrap();
