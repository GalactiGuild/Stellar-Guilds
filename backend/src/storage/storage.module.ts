import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { S3StorageProvider } from './s3-storage.provider';
import { STORAGE_S3_CLIENT_FACTORY } from './storage.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageService,
    S3StorageProvider,
    {
      provide: STORAGE_S3_CLIENT_FACTORY,
      useValue: () => {
        const awsSdk = require('aws-sdk');
        return awsSdk.S3;
      },
    },
  ],
  exports: [StorageService, S3StorageProvider],
})
export class StorageModule {}
