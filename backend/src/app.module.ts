import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BountyExpirationModule } from './bounty-expiration/bounty-expiration.module';

@Module({
  imports: [PrismaModule, BountyExpirationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
