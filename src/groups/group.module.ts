import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Group, GroupSchema } from './group.schema'
import { GroupService } from './group.service'
import { GroupController } from './group.controller'
import { User, UserSchema } from '../users/user.schema';
import { Activity, ActivitySchema } from '../activities/activity.schema'
import { Accomplishment, AccomplishmentSchema } from '../accomplishments/accomplishment.schema';
import { Route, RouteSchema } from '../routes/route.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Accomplishment.name, schema: AccomplishmentSchema },
      { name: Route.name, schema: RouteSchema },
    ])
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}