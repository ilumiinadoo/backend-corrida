import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccomplishmentController } from './accomplishment.controller';
import { AccomplishmentService } from './accomplishment.service';
import { Accomplishment, AccomplishmentSchema } from './accomplishment.schema';
import { Route, RouteSchema } from '../routes/route.schema';
import { Group, GroupSchema } from '../groups/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accomplishment.name, schema: AccomplishmentSchema },
      { name: Route.name, schema: RouteSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [AccomplishmentController],
  providers: [AccomplishmentService],
})
export class AccomplishmentModule {}
