const {root,out,redact}=require('./audit-tools.cjs');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const ev=path.join(out,'evidencias');
const mode=process.argv[2];
const options={cwd:root,env:{...process.env,BACKEND_ENV:'test',npm_config_cache:path.join(ev,'npm-cache'),npm_config_update_notifier:'false',NO_COLOR:'1'},windowsHide:true};
const jobs={
 types:['node_modules/typescript/bin/tsc','-p','server/tsconfig.build.json','--noEmit'],
 lintserver:[path.join(root,'node_modules/eslint/bin/eslint.js'),'.','--no-cache','--format','json'],
 lintclient:[path.join(root,'node_modules/eslint/bin/eslint.js'),'.','--no-cache','--format','json'],
 audit:['C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','audit','--json','--ignore-scripts'],
 auditprod:['C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','audit','--json','--omit=dev','--ignore-scripts'],
 jest:['node_modules/jest/bin/jest.js','--config','server/package.json','--runInBand','--no-cache','--cacheDirectory',path.join(ev,'jest-cache'),'--coverage=false'],
 frontend:[path.join(ev,'run-vitest.mjs')],
 build:['node_modules/vite/bin/vite.js','build','--config',path.join(ev,'vite-audit.mjs'),'--configLoader','native'],
};
if(!jobs[mode])throw Error('Unknown check');
if(mode==='lintserver'||mode==='lintclient')options.cwd=path.join(root,mode==='lintserver'?'server':'client');
const child=spawn(process.execPath,jobs[mode],options);let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
child.on('close',code=>{fs.writeFileSync(path.join(ev,mode+'.log'),redact(output));fs.writeFileSync(path.join(ev,mode+'-meta.json'),JSON.stringify({command:[process.execPath,...jobs[mode]],exitCode:code,date:'2026-10-05',node:process.version},null,2));console.log(mode+' exit='+code+'\n'+redact(output).slice(-5000));});
