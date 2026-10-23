const {root,out,walk}=require('./audit-tools.cjs');
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const ev=path.join(out,'evidencias');
const read=n=>JSON.parse(fs.readFileSync(path.join(ev,n),'utf8'));
const before=read('inventario-inicial.json'),now=walk(),summary=read('resumen-numerico.json'),coverage=read('cobertura-final.json');
const missing=[],changed=[];
for(const e of before.entries){const p=path.join(root,e.path);if(!fs.existsSync(p)){missing.push(e.path);continue;}const hash=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');if(hash!==e.sha256)changed.push(e.path);}
const added=now.files.filter(p=>!before.files.includes(p));
const git=args=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:64*1024*1024});
const status=git(['status','--porcelain=v1']);fs.writeFileSync(path.join(ev,'git-status-final.txt'),status);
const normalize=s=>s.split(/\r?\n/).filter(l=>l&&!l.includes('watsolution_web_reportes/')).sort();
const statusSame=JSON.stringify(normalize(status))===JSON.stringify(normalize(fs.readFileSync(path.join(ev,'git-status-inicial.txt'),'utf8')));
const absent=summary.files.filter(f=>!fs.existsSync(path.join(out,f)));
const {findings}=require('./report-data.cjs');const invalidEvidence=[];
for(const f of findings){const text=fs.readFileSync(path.join(root,f.file),'utf8');if(f.line<1||f.end<f.line||f.end-f.line+1>10||f.end>text.split(/\r?\n/).length)invalidEvidence.push(f.id);}
const mdFiles=fs.readdirSync(out).filter(p=>p.endsWith('.md'));
const malformedFences=mdFiles.filter(p=>(fs.readFileSync(path.join(out,p),'utf8').match(/^```/gm)||[]).length%2);
const ids=mdFiles.flatMap(p=>[...fs.readFileSync(path.join(out,p),'utf8').matchAll(/^### \[(WS-\d+)\]/gm)].map(m=>m[1]));
const allFindingsExactlyOnce=findings.every(f=>ids.filter(id=>id===f.id).length===1)&&ids.length===findings.length;
// Compare actual historical secret values locally without printing or retaining them.
const env=git(['cat-file','blob','95cd0a65f6fe9966ccb5c9974c450610c0c7a624']);
const yml=git(['cat-file','blob','0ea385d4830c10025e3e6e4a74d9abf8c37e7b97']);
const values=[];
for(const m of env.matchAll(/postgres(?:ql)?:\/\/[^:\s]+:([^@\s]+)@/g))values.push(m[1]);
const pg=env.match(/^POSTGRES_PASSWORD\s*=\s*["']?([^\r\n"']+)/m);if(pg)values.push(pg[1].trim());
const jwt=yml.match(/base64-secret:\s*["']?([^\s"'#]+)/);if(jwt){values.push(jwt[1]);values.push(Buffer.from(jwt[1],'base64').toString('utf8'));}
const secretMatches=[];let reportFileCount=0;
function inspect(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())inspect(p);else{reportFileCount++;const b=fs.readFileSync(p);if(b.includes(0))continue;const t=b.toString('utf8');if(values.some(v=>v.length>=8&&t.includes(v)))secretMatches.push(path.relative(out,p).replaceAll('\\','/'));}}}
inspect(out);
const result={checkedAt:new Date().toISOString(),root,reportFolder:out,originalFilesHashed:before.entries.length,missingOriginalFiles:missing,changedOriginalFiles:changed,newFilesOutsideReports:added,gitStatusUnchangedOutsideReports:statusSame,requiredFiles:summary.files.length,missingRequiredFiles:absent,coverage:summary.coverage,coverageEntries:coverage.length,unclassifiedCoverage:coverage.filter(e=>!['revisado','parcial','no revisado'].includes(e.state)).map(e=>e.path),invalidEvidence,malformedFences,allFindingsExactlyOnce,reportFilesScannedForKnownHistoricalSecrets:reportFileCount,knownHistoricalSecretMatches:secretMatches,limitations:'Integridad SHA-256 sobre los 455 archivos del inventario fuente; dependencias, metadatos Git y builds preexistentes excluidos de la comparación por hash. Git se compara adicionalmente. No se afirma verificación byte a byte de carpetas excluidas ni de validez de secretos.'};
result.passed=!missing.length&&!changed.length&&!added.length&&statusSame&&!absent.length&&!invalidEvidence.length&&!malformedFences.length&&allFindingsExactlyOnce&&!secretMatches.length&&coverage.length===before.entries.length;
fs.writeFileSync(path.join(ev,'verificacion-final.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
