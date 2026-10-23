import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import { swaggerAssets } from './swagger-assets.mts';

const isStandalone = process.env.STANDALONE === 'true';

// eslint-disable-next-line prefer-const
let config = defineConfig({
  plugins: [
    vue(),
    swaggerAssets(),
  ],
  root: fileURLToPath(new URL('./src/', import.meta.url)),
  publicDir: isStandalone ? false : fileURLToPath(new URL('./../server/dist/static/public', import.meta.url)),
  cacheDir: isStandalone
    ? fileURLToPath(new URL('./tmp/.vite-cache', import.meta.url))
    : fileURLToPath(new URL('./../tmp/.vite-cache', import.meta.url)),
  build: {
    emptyOutDir: true,
    outDir: isStandalone
      ? fileURLToPath(new URL('./dist/', import.meta.url))
      : fileURLToPath(new URL('./../server/dist/static/', import.meta.url)),
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./src/index.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/app/', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content/', import.meta.url)),
    },
  },
  define: {
    I18N_HASH: '"generated_hash"',
    SERVER_API_URL: '"/"',
    APP_VERSION: JSON.stringify(process.env.APP_VERSION || 'DEV'),
  },
  server: {
    host: '127.0.0.1',
    port: 9000,
    proxy: {
      '/api/notifications/stream': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['x-accel-buffering'] = 'no';
            proxyRes.headers['cache-control'] = 'no-cache';
          });
        },
      },
      ...Object.fromEntries(
        ['/api', '/management', '/v3/api-docs'].map(res => [
          res,
          { target: 'http://localhost:8080', changeOrigin: true },
        ]),
      ),
      '/tank': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

// jhipster-needle-add-vite-config - JHipster will add custom config

export default config;
