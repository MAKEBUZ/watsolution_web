import { bucketClientConfig } from './bucket.service';

describe('bucket authentication configuration', () => {
  it('uses the renewable instance role in AWS without empty explicit keys', () => {
    const config = bucketClientConfig({ BUCKET_REGION: 'us-east-2' });
    expect(config).not.toHaveProperty('credentials');
    expect(config.endpoint).toBeUndefined();
    expect(config.region).toBe('us-east-2');
  });
  it('preserves complete credentials for the existing S3-compatible provider', () => {
    expect(
      bucketClientConfig({
        BUCKET_REGION: 'auto',
        BUCKET_ENDPOINT: 'https://storage.example.test',
        BUCKET_ACCESS_KEY_ID: 'synthetic-id',
        BUCKET_SECRET_ACCESS_KEY: 'synthetic-secret',
      }),
    ).toMatchObject({
      endpoint: 'https://storage.example.test',
      credentials: { accessKeyId: 'synthetic-id', secretAccessKey: 'synthetic-secret' },
    });
  });
  it('rejects incomplete credentials instead of silently switching identity', () => {
    expect(() => bucketClientConfig({ BUCKET_ACCESS_KEY_ID: 'synthetic-id' })).toThrow();
    expect(() => bucketClientConfig({ BUCKET_SECRET_ACCESS_KEY: 'synthetic-secret' })).toThrow();
  });
});
