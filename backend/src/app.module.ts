import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BountyModule } from './bounty/bounty.module';

@Module({
  imports: [ScheduleModule.forRoot(), BountyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}