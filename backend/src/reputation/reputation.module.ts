import { Module } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';
import { ReputationDecayService } from './reputation-decay.service';
import { ReputationDecayController } from './reputation-decay.controller';

@Module({
  controllers: [ReputationController, ReputationDecayController],
  providers: [ReputationService, ReputationDecayService],
  exports: [ReputationService, ReputationDecayService],
})
export class ReputationModule {}
