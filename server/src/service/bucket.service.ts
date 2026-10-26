import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export function bucketClientConfig(env: NodeJS.ProcessEnv): S3ClientConfig {
  const accessKeyId = env.BUCKET_ACCESS_KEY_ID;
  const secretAccessKey = env.BUCKET_SECRET_ACCESS_KEY;
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error('Both bucket credential variables must be set, or neither for an AWS instance role.');
  }
  return {
    region: env.BUCKET_REGION ?? 'auto',
    endpoint: env.BUCKET_ENDPOINT || undefined,
    // Omit credentials to use the SDK chain and renewable Lightsail role.
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    forcePathStyle: false,
  };
}

@Injectable()
export class BucketService {
  private readonly logger = new Logger('BucketService');
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.BUCKET_NAME ?? '';
    this.s3 = new S3Client(bucketClientConfig(process.env));
  }

  async uploadPdf(key: string, buffer: Buffer): Promise<string> {
    return this.uploadFile(key, buffer, 'application/pdf');
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async getPresignedUrl(key: string, expiresIn = 300): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
