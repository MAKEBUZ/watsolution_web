import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        vue: 'vue',
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom', // happy-dom provides a better performance but doesn't have a default url.
      environmentOptions: {
        happyDOM: {
          settings: {
            // Unit tests simulate SDK loading; never download or evaluate third-party scripts.
            enableJavaScriptEvaluation: false,
            disableJavaScriptFileLoading: true,
            enableCSSFileLoading: false,
            enableIframePageLoading: false,
            handleDisabledFileLoadingAsSuccess: true,
          },
        },
      },
      setupFiles: [fileURLToPath(new URL('./src/app/test-setup.ts', import.meta.url))],
      reporters: ['default', 'vitest-sonar-reporter'],
      outputFile: {
        'vitest-sonar-reporter': fileURLToPath(new URL('./../tmp/test-results/TESTS-results-vitest.xml', import.meta.url)),
      },
      coverage: {
        provider: 'v8',
        statements: 85,
        branches: 75,
        lines: 85,
        reportsDirectory: fileURLToPath(new URL('./../tmp/vite-coverage', import.meta.url)),
      },
    },
  }),
);
