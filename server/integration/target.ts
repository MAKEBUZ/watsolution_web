export function integrationTarget(env: NodeJS.ProcessEnv = process.env) {
  if (env.BACKEND_ENV !== 'test' || env.WATSOLUTION_TEST_DATABASE !== 'local-disposable') {
    throw new Error('Integration requires explicit local-disposable test mode');
  }
  let url: URL;
  try { url = new URL(env.TEST_DATABASE_URL ?? ''); }
  catch { throw new Error('A dedicated TEST_DATABASE_URL is required'); }
  if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.port !== '55432'
    || url.username !== 'ws_test' || url.pathname !== '/ws_integration'
    || !url.password || url.search || url.hash) {
    throw new Error('Integration target rejected: use the isolated loopback database defined in docker/postgresql-test.yml');
  }
  return { host: '127.0.0.1', port: 55432, username: 'ws_test', password: decodeURIComponent(url.password), database: 'ws_integration' };
}
