import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Workbook} from '@oai/artifact-tool';
const out=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(out);
const json=async n=>JSON.parse(await fs.readFile(path.join(out,n),'utf8'));
const original=await json('integridad-inicial.json'),input=await json('entrada-csv.json'),tasks=await json('backlog-datos.json'),numeric=await json('resumen-calculado.json');
const expected=['00_supuestos_y_alcance.md','01_resumen_ejecutivo_plan.md','02_triaje_hallazgos.md','03_backlog_tareas.csv','04_roadmap_por_fases.md','05_quick_wins.md','06_dependencias_y_orden.md','07_estrategia_de_pruebas.md','08_despliegue_y_rollback.md','09_riesgos_del_plan.md','10_matriz_trazabilidad.md','11_metricas_y_cierre.md'];
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const errors=[],changed=[],missing=[],newFiles=[];
const origMap=new Map(original.entries.map(e=>[e.path,e]));
for(const entry of original.entries){const p=path.join(root,entry.path);if(!await exists(p)){missing.push(entry.path);continue;}if(sha(await fs.readFile(p))!==entry.sha256)changed.push(entry.path);}
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(['node_modules','.git','watsolution_web_planning','dist','.cache','.vite'].includes(e.name))continue;await walk(p);}else{const rel=path.relative(root,p).replaceAll('\\','/');if(!origMap.has(rel))newFiles.push(rel);}}}
await walk(root);
const git=args=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:64*1024*1024});
const normalize=s=>s.split(/\r?\n/).filter(l=>l&&!l.includes('watsolution_web_planning/')).sort();
const gitSame=JSON.stringify(normalize(original.status))===JSON.stringify(normalize(git(['status','--porcelain=v1'])));
for(const name of expected)if(!await exists(path.join(out,name)))errors.push('Falta '+name);
const wb=await Workbook.fromCSV((await fs.readFile(path.join(out,expected[3]),'utf8')).replace(/^\uFEFF/,''),{sheetName:'Backlog'});
const [headers,...raw]=wb.worksheets.getItem('Backlog').getUsedRange().values;
const rows=raw.filter(r=>r[0]);
if(headers.length!==19||rows.length!==tasks.length)errors.push('CSV filas/columnas incorrectas');
const ids=new Set(input.map(f=>f.ID)),taskIds=new Set(tasks.map(t=>t.id));
if(taskIds.size!==tasks.length)errors.push('Tareas duplicadas');
const missingAcceptance=[],badStates=[],badRanges=[],unknownDeps=[],phaseIssues=[];
for(const t of tasks){if(!t.accept?.length||!t.verify?.trim()||!t.rollback?.trim())missingAcceptance.push(t.id);if(t.state!=='Pendiente')badStates.push(t.id);if(t.hours[0]<1||t.hours[1]>24||t.hours[0]>t.hours[1])badRanges.push(t.id);for(const id of t.ids)if(!ids.has(id))errors.push('ID desconocido '+id);for(const d of t.deps){const predecessor=tasks.find(x=>x.id===d);if(!predecessor)unknownDeps.push([t.id,d]);else if(predecessor.phase>t.phase)phaseIssues.push([t.id,d]);}}
for(const r of rows){if(r.length!==19||!r[14]?.trim()||!r[15]?.trim()||r[18]!=='Pendiente')errors.push('CSV incompleto '+r[0]);}
const visited=new Set(),active=new Set();let cycle=false;
function dfs(t){if(active.has(t.id)){cycle=true;return;}if(visited.has(t.id))return;active.add(t.id);for(const id of t.deps){const d=tasks.find(x=>x.id===id);if(d)dfs(d);}active.delete(t.id);visited.add(t.id);}
tasks.forEach(dfs);
const matrix=await fs.readFile(path.join(out,'10_matriz_trazabilidad.md'),'utf8');
const uncovered=input.filter(f=>!tasks.some(t=>t.ids.includes(f.ID))||!matrix.includes('| '+f.ID+' |')).map(f=>f.ID);
const matrixRows=[...matrix.matchAll(/^\| (WS-\d+) \|/gm)].map(m=>m[1]);
if(matrixRows.length!==47||new Set(matrixRows).size!==47)errors.push('Matriz no tiene 47 filas únicas');
const highTasks=tasks.filter(t=>['Alta','Crítica'].includes(t.severity));
const missingCards=[];for(const t of highTasks)if(!await exists(path.join(out,'fichas_tareas',t.id+'.md')))missingCards.push(t.id);
const total=[0,1].map(k=>tasks.reduce((s,t)=>s+t.hours[k],0));
if(JSON.stringify(total)!==JSON.stringify(numeric.totalHours))errors.push('Suma de esfuerzo incorrecta');
const sourcePathsMissing=[];
for(const t of tasks)for(const a of t.files){if(/^(server|client|docker|\.github|\.[a-z]|package|README)/.test(a)&&!/(nuevo|nueva|propuest)/.test(a)){const f=a.split(' (')[0];if(!await exists(path.join(root,f)))sourcePathsMissing.push({id:t.id,file:a});}}
const allDocs=[];async function docWalk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='node_modules')continue;const p=path.join(dir,e.name);if(e.isDirectory())await docWalk(p);else if(e.name.endsWith('.md'))allDocs.push(p);}}await docWalk(out);
const badFences=[],brokenLinks=[];
for(const p of allDocs){const txt=await fs.readFile(p,'utf8');if((txt.match(/^```/gm)||[]).length%2)badFences.push(path.relative(out,p));for(const m of txt.matchAll(/\]\(([^)]+)\)/g)){const target=m[1];if(!/^(?:https?:|#)/.test(target)&&!target.startsWith('verificacion-final.json')&&!await exists(path.resolve(path.dirname(p),target)))brokenLinks.push({file:path.relative(out,p),target});}}
// Detecta valores históricos conocidos sin conservar ni imprimir los valores.
const env=git(['cat-file','blob','95cd0a65f6fe9966ccb5c9974c450610c0c7a624']),yml=git(['cat-file','blob','0ea385d4830c10025e3e6e4a74d9abf8c37e7b97']);const secrets=[];
for(const m of env.matchAll(/postgres(?:ql)?:\/\/[^:\s]+:([^@\s]+)@/g))secrets.push(m[1]);
const pg=env.match(/^POSTGRES_PASSWORD\s*=\s*["']?([^\r\n"']+)/m);if(pg)secrets.push(pg[1].trim());
const jwt=yml.match(/base64-secret:\s*["']?([^\s"'#]+)/);if(jwt){secrets.push(jwt[1],Buffer.from(jwt[1],'base64').toString('utf8'));}
const secretMatches=[];async function secretWalk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='node_modules')continue;const p=path.join(dir,e.name);if(e.isDirectory())await secretWalk(p);else{const b=await fs.readFile(p);if(!b.includes(0)&&secrets.some(s=>s.length>=8&&b.toString('utf8').includes(s)))secretMatches.push(path.relative(out,p));}}}await secretWalk(out);
const result={checkedAt:new Date().toISOString(),sourceOfTruth:'watsolution_web_reportes/18_hallazgos.csv',findings:input.length,tasks:tasks.length,coveragePercent:100*(input.length-uncovered.length)/input.length,uncoveredFindings:uncovered,csvRows:rows.length,csvColumns:headers.length,missingAcceptanceOrVerification:missingAcceptance,invalidStates:badStates,invalidEffortRanges:badRanges,unknownDependencies:unknownDeps,dependenciesAcrossInvalidPhases:phaseIssues,cyclicDependencies:cycle,mandatoryDocuments:expected.length,highTaskCards:highTasks.length,missingCards,effortHours:total,missingSourceReferences:sourcePathsMissing,brokenMarkdownFences:badFences,brokenLinks,knownSecretMatches:secretMatches,originalFilesHashed:original.entries.length,reportFilesHashed:original.entries.filter(e=>e.path.startsWith('watsolution_web_reportes/')).length,modifiedOutsidePlanning:changed,missingOutsidePlanning:missing,newFilesOutsidePlanning:newFiles,gitStatusUnchangedOutsidePlanning:gitSame,errors,integrityLimit:'SHA-256 de los 716 archivos fuente/reportes iniciales. node_modules, .git, dist y cachés de aplicación excluidos; estado Git contrastado adicionalmente. No se instalaron paquetes, no se ejecutaron pruebas de aplicación ni scripts de auditoría que escriben en reportes.',applicationCommandsExecuted:false};
result.passed=!errors.length&&!changed.length&&!missing.length&&!newFiles.length&&gitSame&&!uncovered.length&&!cycle&&!missingAcceptance.length&&!badStates.length&&!badRanges.length&&!unknownDeps.length&&!phaseIssues.length&&!missingCards.length&&!sourcePathsMissing.length&&!badFences.length&&!brokenLinks.length&&!secretMatches.length;
await fs.writeFile(path.join(out,'verificacion-final.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
