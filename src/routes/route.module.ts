import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Route, RouteSchema } from './route.schema'
import { Group, GroupSchema } from '../groups/group.schema'
import { RouteService } from './route.service'
import { RouteController } from './route.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Route.name, schema: RouteSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [MongooseModule],
})
export class RouteModule {}
