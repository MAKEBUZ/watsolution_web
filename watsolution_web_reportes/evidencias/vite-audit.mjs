import config from '../../client/vite.config.mts';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ev=path.dirname(fileURLToPath(import.meta.url));
export default {...config,envDir:ev,cacheDir:path.join(ev,'vite-cache'),build:{...config.build,outDir:path.join(ev,'build'),emptyOutDir:false}};
