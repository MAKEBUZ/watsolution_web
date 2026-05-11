import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class BucketService {
  private readonly logger = new Logger('BucketService');
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.BUCKET_NAME ?? '';
    this.s3 = new S3Client({
      region: process.env.BUCKET_REGION ?? 'auto',
      endpoint: process.env.BUCKET_ENDPOINT,
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY ?? '',
      },
      forcePathStyle: true,
    });
  }

  async uploadPdf(key: string, buffer: Buffer): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
      }),
    );
    return key;
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
