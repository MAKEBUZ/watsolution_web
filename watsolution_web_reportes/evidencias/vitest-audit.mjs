import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ev=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(ev,'../..');
export default defineConfig({root:path.join(root,'client/src'),envDir:ev,cacheDir:path.join(ev,'vitest-cache'),plugins:[vue()],resolve:{alias:{vue:'vue','@':path.join(root,'client/src/app'),'@content':path.join(root,'client/src/content')}},define:{I18N_HASH:'"generated_hash"',SERVER_API_URL:'"/"',APP_VERSION:'"DEV"'},test:{globals:true,environment:'happy-dom',setupFiles:[path.join(root,'client/src/app/test-setup.ts')],reporters:['default'],coverage:{enabled:false},maxWorkers:2,minWorkers:1}});
