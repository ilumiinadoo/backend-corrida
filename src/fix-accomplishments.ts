import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Accomplishment, AccomplishmentSchema } from './accomplishments/accomplishment.schema';
import { Route, RouteSchema } from './routes/route.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Injectable()
class FixAccomplishmentsService {
  constructor(
    @InjectModel(Accomplishment.name) private accomplishmentModel: Model<Accomplishment>,
    @InjectModel(Route.name) private routeModel: Model<Route>,
  ) {}

  async runFix() {
    console.log('🔍 Buscando accomplishments sem groupId...');
    const accomplishments = await this.accomplishmentModel.find({ groupId: { $exists: false } }).lean();

    console.log(`👉 Encontrados ${accomplishments.length} accomplishments para corrigir.`);

    for (const acc of accomplishments) {
      const rota = await this.routeModel.findById(acc.rotaId).lean();
      if (rota && rota.groupId) {
        await this.accomplishmentModel.updateOne(
          { _id: acc._id },
          { $set: { groupId: rota.groupId } }
        );
        console.log(`✅ Accomplishment ${acc._id} atualizado com groupId ${rota.groupId}`);
      } else {
        console.warn(`⚠️ Rota não encontrada ou sem groupId para accomplishment ${acc._id}`);
      }
    }

    console.log('🏁 Correção concluída!');
  }
}

@Module({
  imports: [
    AppModule,
    MongooseModule.forFeature([
      { name: Accomplishment.name, schema: AccomplishmentSchema },
      { name: Route.name, schema: RouteSchema },
    ]),
  ],
  providers: [FixAccomplishmentsService],
})
class FixModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(FixModule);
  const service = app.get(FixAccomplishmentsService);
  await service.runFix();
  await app.close();
}

bootstrap();
