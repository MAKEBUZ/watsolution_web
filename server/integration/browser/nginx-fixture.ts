import { execFileSync, spawn } from 'child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { createServer } from 'net';
import https from 'https';

export async function startNginx(upstream: string, webDist: string, key: string, cert: string) {
  if (process.env.BACKEND_ENV !== 'test' || process.env.WATSOLUTION_TEST_DATABASE !== 'local-disposable'
    || !/^https:\/\/127\.0\.0\.1:\d+$/.test(upstream)) throw new Error('Isolated loopback upstream required');
  // Independent process and config. Never use or reload the host's default Nginx configuration.
  const temporaryRoot = resolve('tmp'); mkdirSync(temporaryRoot, { recursive: true });
  const dir = mkdtempSync(join(temporaryRoot, 'ws-nginx-'));
  const listener = createServer();
  await new Promise<void>(resolve => listener.listen(0, '127.0.0.1', resolve));
  const port = (listener.address() as { port: number }).port;
  await new Promise<void>(resolve => listener.close(() => resolve()));
  const quoted = (path: string) => '"' + resolve(path).replace(/\\/g, '/').replace(/"/g, '\\"') + '"';
  let template = readFileSync(resolve(__dirname, '../../../client/nginx.conf'), 'utf8');
  if (!template.includes('${PORT}') || !template.includes('/usr/share/nginx/html')) throw new Error('Unexpected proxy template');
  template = template.replace('${PORT}', `127.0.0.1:${port} ssl`)
    .replace('/usr/share/nginx/html', quoted(webDist)).replaceAll('${BACKEND_URL}', upstream);
  template = template.replace('server {', `server {
    ssl_certificate ${quoted(cert)};
    ssl_certificate_key ${quoted(key)};
    # These exact locations exist only in the test harness.
    location = /test-session { proxy_pass ${upstream}; }
    location = /session-client.js { proxy_pass ${upstream}; }
  `);
  const config = join(dir, 'nginx.conf');
  writeFileSync(config, `pid ${quoted(join(dir, 'nginx.pid'))};
error_log ${quoted(join(dir, 'error.log'))};
events { worker_connections 128; }
http { include /etc/nginx/mime.types; access_log off; ${template} }
`);
  execFileSync('nginx', ['-t', '-p', dir + '/', '-c', config], { stdio: 'pipe' });
  const child = spawn('nginx', ['-p', dir + '/', '-c', config, '-g', 'daemon off; master_process off;'], { stdio: 'ignore' });
  let processError: Error | undefined;
  child.on('error', error => { processError = error; });
  const close = async () => {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
    await new Promise<void>(resolve => {
      child.once('exit', () => { clearTimeout(timer); resolve(); });
      const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
      child.kill('SIGTERM');
    });
  };
  const origin = `https://127.0.0.1:${port}`;
  try {
    for (let i = 0; i < 60; i++) {
      if (processError || child.exitCode !== null) throw processError ?? new Error('Isolated Nginx exited');
      const ready = await new Promise<boolean>(resolve => {
        const req = https.get(origin + '/test-session', { rejectUnauthorized: false }, res => {
          res.resume(); resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false)); req.setTimeout(500, () => req.destroy());
      });
      if (ready) return { origin, close };
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Isolated Nginx did not become ready');
  } catch (error) { await close(); throw error; }
}
