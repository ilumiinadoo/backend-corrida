import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { RouteModule } from '../routes/route.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    RouteModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}