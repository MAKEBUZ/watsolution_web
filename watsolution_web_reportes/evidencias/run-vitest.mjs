import {startVitest} from 'vitest/node';
import config from './vitest-audit.mjs';
const ctx=await startVitest('test',[],{...config.test,root:config.root,run:true,config:false},{...config,configFile:false});
await ctx?.close();
