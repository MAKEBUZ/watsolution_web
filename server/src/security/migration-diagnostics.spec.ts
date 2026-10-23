import { migrationFailure } from './migration-diagnostics';

describe('migration diagnostics', () => {
  it('reports the PostgreSQL error code and stage without leaking SQL or data', () => {
    const result = migrationFailure('apply', {
      message: 'password=synthetic-private-value',
      query: 'private SQL',
      parameters: ['private data'],
      driverError: { code: '42P01', detail: 'private row' },
    });
    expect(result).toMatchObject({ stage: 'apply', code: '42P01' });
    expect(JSON.stringify(result)).not.toMatch(/synthetic-private|private SQL|private data|private row/);
  });
  it('reports TLS failures and refuses arbitrary exception text', () => {
    expect(migrationFailure('connection', { code: 'SELF_SIGNED_CERT_IN_CHAIN' }).code).toBe('SELF_SIGNED_CERT_IN_CHAIN');
    expect(migrationFailure('secret', { code: 'postgres://private' })).toMatchObject({ stage: 'unknown', code: 'UNCLASSIFIED' });
    expect(migrationFailure('connection', null).code).toBe('UNCLASSIFIED');
  });
});
