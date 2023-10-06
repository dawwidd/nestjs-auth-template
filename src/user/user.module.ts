import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserSchema } from './user.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'user', schema: UserSchema}])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
