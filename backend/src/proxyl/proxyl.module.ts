import { Module } from '@nestjs/common';
import { ProxylService } from './proxyl.service';
import { ImageProxyController } from './proxyl.controller';
import { ImageProxyService } from './image-proxyl-service';

@Module({
  controllers: [ImageProxyController],
  providers: [ProxylService, ImageProxyService],
})
export class ProxylModule {}
