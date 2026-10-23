import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';
import { getAbsoluteFSPath } from 'swagger-ui-dist';

/** Copy only known documentation assets; no glob watcher or request-controlled filesystem paths. */
export function swaggerAssets(): Plugin {
  const directory = getAbsoluteFSPath();
  const files = new Map<string, string>();
  for (const name of readdirSync(directory)) {
    if (/\.(js|css|html|png)$/.test(name) && name !== 'index.html') files.set(name, join(directory, name));
  }
  files.set('index.html', fileURLToPath(new URL('./src/swagger-ui/index.html', import.meta.url)));
  const require = createRequire(import.meta.url);
  files.set('axios.min.js', join(dirname(require.resolve('axios/package.json')), 'dist', 'axios.min.js'));
  const contentTypes = { js: 'application/javascript', css: 'text/css', html: 'text/html', png: 'image/png' };
  return {
    name: 'watsolution-swagger-assets',
    generateBundle() {
      for (const [name, path] of files) this.emitFile({ type: 'asset', fileName: `swagger-ui/${name}`, source: readFileSync(path) });
    },
    configureServer(server) {
      server.middlewares.use('/swagger-ui', (req, res, next) => {
        const name = (req.url ?? '').split('?')[0].replace(/^\//, '');
        const path = files.get(name);
        if (!path || !['GET', 'HEAD'].includes(req.method ?? '')) { next(); return; }
        res.setHeader('Content-Type', contentTypes[name.split('.').pop() as keyof typeof contentTypes]);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store');
        res.end(req.method === 'HEAD' ? undefined : readFileSync(path));
      });
    },
  };
}
