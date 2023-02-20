import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database';
import { userProviders } from './user.provider';
import { UserService } from './user.service';

@Module({
  providers: [UserService, ...userProviders],
  imports: [DatabaseModule],
  exports: [UserService],
})
export class UserModule {}
