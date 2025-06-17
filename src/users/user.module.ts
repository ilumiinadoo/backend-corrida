import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IsEmailUnicoConstraint } from './validators/is-email-unico.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserService, IsEmailUnicoConstraint],
  controllers: [UserController],
  exports: [UserService], // para uso no Auth
})
export class UserModule {}