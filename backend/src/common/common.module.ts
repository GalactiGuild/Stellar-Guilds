import { Global, Module } from '@nestjs/common';
import { ExchangeRateService } from './services/exchange-rate.service';

@Global()
@Module({
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class CommonModule {}
