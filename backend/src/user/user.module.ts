import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProfileViewService } from './profile-view.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule, RedisModule],
  controllers: [UserController],
  providers: [UserService, ProfileViewService],
  exports: [UserService],
})
export class UserModule {}
