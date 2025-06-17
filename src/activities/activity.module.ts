import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Activity, ActivitySchema } from './activity.schema'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Activity.name, schema: ActivitySchema }])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
