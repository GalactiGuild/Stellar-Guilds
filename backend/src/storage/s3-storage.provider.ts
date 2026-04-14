import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import * as path from 'path';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * S3StorageProvider — Abstract Cloud File Storage Wrapper
 *
 * Uses AWS SDK v3 (@aws-sdk/client-s3) for S3 operations.
 * Supports streaming uploads to avoid OOM on large files.
 * Falls back gracefully when S3 is not configured.
 */
@Injectable()
export class S3StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private s3Client: S3Client | null = null;
  private bucket: string = '';

  constructor(private readonly configService: ConfigService) {
    this.initializeClient();
  }

  /**
   * Check if S3 is properly configured and available
   */
  isAvailable(): boolean {
    return this.s3Client !== null;
  }

  /**
   * Get the configured bucket name
   */
  getBucketName(): string {
    return this.bucket;
  }

  /**
   * Upload a file buffer/stream to S3.
   * Uses streams internally to handle large files without OOM.
   *
   * @param bufferOrStream - Buffer or Readable stream of file content
   * @param originalName - Original filename (for extension detection)
   * @param contentType - MIME type (auto-detected if not provided)
   * @param folder - Optional subfolder prefix (e.g., 'avatars', 'bounties')
   * @returns Public URL of the uploaded file
   */
  async upload(
    bufferOrStream: Buffer | Readable,
    originalName: string,
    contentType?: string,
    folder?: string,
  ): Promise<UploadResult> {
    this.ensureAvailable();

    const key = this.buildKey(originalName, folder);
    const detectedType =
      contentType || this.detectContentType(originalName);

    // Convert Buffer to stream for consistent handling
    const bodyStream =
      bufferOrStream instanceof Buffer
        ? Readable.from(bufferOrStream)
        : bufferOrStream;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bodyStream,
        ContentType: detectedType,
        // Cache-control headers for better CDN behavior
        CacheControl: 'public, max-age=31536000, immutable',
      });

      await this.s3Client!.send(command);

      const url = this.buildPublicUrl(key);

      this.logger.log(`Uploaded ${key} → ${url}`);

      return { url, key, bucket: this.bucket };
    } catch (error) {
      this.logger.error(`S3 upload failed for key ${key}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Delete a file from S3 by its key
   */
  async delete(key: string): Promise<void> {
    this.ensureAvailable();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client!.send(command);
      this.logger.log(`Deleted S3 object: ${key}`);
    } catch (error) {
      this.logger.warn(`S3 delete failed for key ${key}:`, error);
      // Don't throw — deletion failures are non-critical
    }
  }

  /**
   * Generate a presigned URL for private/temporary access
   * Useful for direct client uploads or temporary downloads
   */
  async getPresignedUrl(
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    this.ensureAvailable();

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client!, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /* ---- Initialization ---- */

  private initializeClient(): void {
    const config = this.readConfig();
    if (!config) {
      this.logger.warn(
        'S3 not configured — set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET in .env',
      );
      return;
    }

    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.bucket = config.bucket;
    this.logger.log(
      `S3 client initialized — bucket: ${config.bucket}, region: ${config.region}`,
    );
  }

  private readConfig(): S3Config | null {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const region = this.configService.get<string>('AWS_REGION');
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      return null;
    }

    return { region, bucket, accessKeyId, secretAccessKey };
  }

  /* ---- Key / URL helpers ---- */

  private buildKey(originalName: string, folder?: string): string {
    const ext = path.extname(originalName) || '';
    const sanitizedName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);
    const uuid = randomUUID();
    const namePart = sanitizedName || 'file';
    const key = `${uuid}-${namePart}${ext}`;
    return folder ? `${folder}/${key}` : key;
  }

  private buildPublicUrl(key: string): string {
    const region = this.configService.get<string>('AWS_REGION');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  /* ---- Content type detection ---- */

  private detectContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.txt': 'text/plain',
    };
    return mimeMap[ext] || 'application/octet-stream';
  }

  /* ---- Guards ---- */

  private ensureAvailable(): void {
    if (!this.s3Client) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Set AWS credentials in .env',
      );
    }
  }
}
