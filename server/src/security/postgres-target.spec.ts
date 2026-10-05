import { integrationTarget } from '../../integration/target';

describe('Disposable PostgreSQL target', () => {
  const env = { BACKEND_ENV: 'test', WATSOLUTION_TEST_DATABASE: 'local-disposable',
    TEST_DATABASE_URL: 'postgresql://ws_test:synthetic@127.0.0.1:55432/ws_integration' };
  it('accepts only the dedicated local test destination', () => {
    expect(integrationTarget(env)).toMatchObject({ host: '127.0.0.1', port: 55432, database: 'ws_integration', username: 'ws_test' });
  });
  it.each([
    'postgresql://ws_test:synthetic@production.example:55432/ws_integration',
    'postgresql://ws_test:synthetic@127.0.0.1:5432/ws_integration',
    'postgresql://postgres:synthetic@127.0.0.1:55432/ws_integration',
    'postgresql://ws_test:synthetic@127.0.0.1:55432/production',
    'postgresql://ws_test:synthetic@127.0.0.1:55432/ws_integration?options=-csearch_path=public',
    'postgresql://ws_test:synthetic@127.0.0.1:55432/ws_integration#extra',
    '',
  ])('rejects unsafe or unspecified destination #%#', url => {
    expect(() => integrationTarget({ ...env, TEST_DATABASE_URL: url })).toThrow();
  });
  it.each([{ ...env, BACKEND_ENV: 'prod' }, { ...env, WATSOLUTION_TEST_DATABASE: '' }, { DATABASE_URL: env.TEST_DATABASE_URL }])
    ('rejects absent opt-in and never falls back to application DATABASE_URL #%#', candidate => {
      expect(() => integrationTarget(candidate)).toThrow();
    });
});
