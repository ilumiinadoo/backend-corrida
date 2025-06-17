import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { ActivityModule } from './activities/activity.module'
import { RunController } from './runs/run.controller'
import { GroupModule } from './groups/group.module'
import { RouteModule } from './routes/route.module'
import { AccomplishmentModule } from './accomplishments/accomplishment.module';
import { EventModule } from './events/event.module'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ acessível em toda a aplicação
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/corrida'),
    UserModule,
    AuthModule,
    ActivityModule,
    GroupModule,
    RouteModule,
    AccomplishmentModule,
    EventModule,
  ],
  controllers: [RunController],
})
export class AppModule {}
