import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database';
import { userProviders } from './user.provider';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, ...userProviders],
  imports: [DatabaseModule],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
