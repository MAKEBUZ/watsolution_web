import { URL, fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';

import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const { getAbsoluteFSPath } = await import('swagger-ui-dist');
const swaggerUiPath = getAbsoluteFSPath();

const isStandalone = process.env.STANDALONE === 'true';

// eslint-disable-next-line prefer-const
let config = defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: [
            `${normalizePath(swaggerUiPath)}/*.{js,css,html,png}`,
            `!${normalizePath(swaggerUiPath)}/**/index.html`,
            normalizePath(fileURLToPath(new URL('./dist/axios.min.js', import.meta.resolve('axios/package.json')))),
            normalizePath(fileURLToPath(new URL('./src/swagger-ui/index.html', import.meta.url))),
          ],
          dest: 'swagger-ui',
        },
      ],
    }),
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
      vue: '@vue/compat/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src/app/', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content/', import.meta.url)),
    },
  },
  define: {
    I18N_HASH: '"generated_hash"',
    SERVER_API_URL: '"/"',
    APP_VERSION: `"${process.env.APP_VERSION ? process.env.APP_VERSION : 'DEV'}"`,
  },
  server: {
    host: true,
    port: 9000,
    proxy: Object.fromEntries(
      ['/api', '/management', '/v3/api-docs'].map(res => [
        res,
        {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      ]),
    ),
  },
});

// jhipster-needle-add-vite-config - JHipster will add custom config

export default config;
