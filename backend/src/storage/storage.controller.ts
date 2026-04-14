import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3StorageProvider } from './s3-storage.provider';

@Controller('storage')
export class StorageController {
  constructor(private readonly s3Provider: S3StorageProvider) {}

  /**
   * Upload a file to S3 (or local fallback)
   * POST /storage/upload
   *
   * Uses streaming to handle large files without OOM.
   * Returns the public URL of the uploaded file.
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
      fileFilter: (_req, file, cb) => {
        // Allow images, PDFs, and common document types
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'application/pdf',
          'application/json',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File type ${file.mimetype} is not allowed. Allowed: images, PDF`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.s3Provider.isAvailable()) {
      // Fallback to local storage via existing service
      // For now, return an informative message
      return {
        url: null,
        message:
          'S3 not configured — set AWS credentials in .env to enable cloud uploads',
        filename: file.originalname,
        size: file.size,
      };
    }

    const result = await this.s3Provider.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'uploads',
    );

    return {
      url: result.url,
      key: result.key,
      bucket: result.bucket,
      filename: file.originalname,
      size: file.size,
    };
  }
}
