/* Runs only against the disposable, isolated PostgreSQL fixture created by the release script. */
require('reflect-metadata');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { DataSource } = require('typeorm');
const { WhatsappAccounts1792819200000 } = require('../dist/migrations/1792819200000-WhatsappAccounts');
const { WhatsappAccountService } = require('../dist/service/whatsapp-account.service');
const { WhatsappAssistantService } = require('../dist/service/whatsapp-assistant.service');
const { WhatsappWorkerService } = require('../dist/service/whatsapp-worker.service');
const { WhatsappService } = require('../dist/service/whatsapp.service');
const { WhatsappModule } = require('../dist/module/whatsapp.module');
const { WhatsappTemplateService } = require('../dist/service/whatsapp-template.service');
const { createHmac } = require('node:crypto');

const target = process.env.WHATSAPP_TEST_DATABASE;
assert(target && new URL(target).hostname === 'wa-assistant-test-db' && new URL(target).pathname === '/wa_assistant_test');
Object.assign(process.env, { WHATSAPP_ENABLED:'true',WHATSAPP_ASSISTANT_ENABLED:'true',WHATSAPP_NOTIFICATIONS_ENABLED:'true',
  WHATSAPP_GRAPH_VERSION:'v23.0',WHATSAPP_PHONE_NUMBER_ID:'10001',WHATSAPP_BUSINESS_ACCOUNT_ID:'20001',
  WHATSAPP_ACCESS_TOKEN:'synthetic',WHATSAPP_APP_SECRET:'synthetic-app-secret',WHATSAPP_VERIFY_TOKEN:'synthetic-verification-token-32-characters',
  WHATSAPP_TEMPLATE_CREATED:'test_created',WHATSAPP_TEMPLATE_DUE:'test_due',WHATSAPP_TEMPLATE_PAID:'test_paid' });
const db = new DataSource({type:'postgres',url:target,logging:false,synchronize:false});
let runtime;
let count=0;
const passed = name => { count++; console.log('PASS ' + name); };
const sent=[];
global.fetch=async(url,options)=>{
  if(url.includes('/message_templates?')) return new Response(JSON.stringify({data:['test_created','test_due','test_paid'].map(name=>({name,status:'APPROVED',category:'UTILITY',language:'es'}))}),{status:200});
  sent.push(JSON.parse(options.body));return new Response(JSON.stringify({messages:[{id:'wamid.out.'+sent.length}]}),{status:200});};

(async()=>{
  await db.initialize();
  await db.query(`CREATE TABLE jhi_user(id integer PRIMARY KEY, activated boolean NOT NULL);
    CREATE TABLE jhi_user_authorities_jhi_authority("jhiUserId" integer REFERENCES jhi_user(id),"jhiAuthorityName" varchar(50));
    CREATE TABLE person(id integer PRIMARY KEY,user_id varchar(30));
    CREATE TABLE invoice(id serial PRIMARY KEY,"personId" integer REFERENCES person(id),issue_date date,due_date date,
      consumption_m_3 numeric(10,2),amount_due numeric(10,2),status varchar(20));
    INSERT INTO jhi_user VALUES(1,true),(2,true),(3,true),(4,false);
    INSERT INTO jhi_user_authorities_jhi_authority VALUES(1,'ROLE_ADMIN'),(2,'ROLE_USER'),(4,'ROLE_ADMIN');
    INSERT INTO person VALUES(1,'1'),(2,'2'),(3,'3'),(4,'3'),(5,'4');
    INSERT INTO invoice("personId",issue_date,due_date,consumption_m_3,amount_due,status) VALUES
      (1,CURRENT_DATE,CURRENT_DATE+30,12,45000,'PENDING'),(2,CURRENT_DATE,CURRENT_DATE+30,998877,887766,'PENDING');`);
  const q=db.createQueryRunner();
  await new WhatsappAccounts1792819200000().up(q);await q.release();
  assert.equal((await db.query('SELECT * FROM whatsapp_invoice_event')).length,0);passed('migration creates no historical invoice events');
  await db.query(`CREATE ROLE fixture_runtime LOGIN PASSWORD 'synthetic-runtime-password';
    GRANT SELECT ON jhi_user,jhi_user_authorities_jhi_authority,person,invoice TO fixture_runtime;
    GRANT SELECT,INSERT,UPDATE,DELETE ON whatsapp_link,whatsapp_link_code,whatsapp_inbox,whatsapp_invoice_event,whatsapp_outbox TO fixture_runtime;
    GRANT USAGE,SELECT ON SEQUENCE whatsapp_invoice_event_id_seq TO fixture_runtime;`);
  const runtimeUrl=new URL(target);runtimeUrl.username='fixture_runtime';runtimeUrl.password='synthetic-runtime-password';
  runtime=new DataSource({type:'postgres',url:runtimeUrl.toString(),logging:false,synchronize:false});await runtime.initialize();
  await assert.rejects(()=>runtime.query('CREATE TABLE forbidden_runtime_ddl(id integer)'));passed('runtime has no schema creation privileges');
  const templates=new WhatsappTemplateService(),accounts=new WhatsappAccountService(runtime,templates),assistant=new WhatsappAssistantService(runtime,accounts),worker=new WhatsappWorkerService(runtime,templates);
  for (const name of ['scheduleNotifications','deliver']) {
    const method=worker[name].bind(worker);
    worker[name]=async(...args)=>{try{return await method(...args);}catch(error){console.error('Fixture failure in '+name+': '+error.message);throw error;}};
  }
  let sequence=0;
  const inbound=async(text,phone='573000000001',id)=>assistant.ingest({id:id||'wamid.in.'+(++sequence),from:phone,timestamp:Date.now(),text});
  await assert.rejects(()=>accounts.createCode(3,'573000000003'));await assert.rejects(()=>accounts.createCode(4,'573000000004'));
  await assert.rejects(()=>accounts.createCode(1,'+573000000001'));passed('inactive, ambiguous and invalid linking requests rejected');
  const c=await accounts.createCode(1,'573000000001');
  assert(!(JSON.stringify(await db.query('SELECT * FROM whatsapp_link_code'))).includes(c.code));
  await inbound('VINCULAR '+c.code,'573000000002');assert.equal((await accounts.status(1)).linked,false);passed('code hashed and bound to declared sender');
  await inbound('VINCULAR '+c.code);assert.equal((await accounts.status(1)).linked,true);assert.equal((await accounts.status(1)).notifications,false);
  const originalLink=(await db.query('SELECT id FROM whatsapp_link WHERE user_id=1'))[0].id;
  await inbound('VINCULAR '+c.code);assert.equal((await db.query('SELECT id FROM whatsapp_link WHERE user_id=1'))[0].id,originalLink);passed('single-use linking and explicit opt-in');
  await inbound('Mis facturas de cedula 887766');await worker.tick();
  const bills=sent.find(s=>s.text?.body.includes('Saldo pendiente:')).text.body;
  assert(bills.includes('45.000'));assert(!bills.includes('887.766'));assert(!bills.includes('998.877'));passed('bill requests cannot select another subscriber');
  await inbound('consumo');await worker.tick();assert(sent.at(-1).text.body.includes('12 m³'));passed('consumption uses billed interval, not cumulative meter value');
  const duplicate='wamid.duplicate';await Promise.all([inbound('hola',undefined,duplicate),inbound('hola',undefined,duplicate)]);await worker.tick();
  assert.equal((await db.query('SELECT * FROM whatsapp_outbox WHERE dedup_key=$1',['reply:'+duplicate])).length,1);passed('persistent concurrent webhook deduplication');
  const c2=await accounts.createCode(2,'573000000001');await inbound('VINCULAR '+c2.code);assert.equal((await accounts.status(2)).linked,false);passed('phone cannot be rebound to another account');
  await accounts.preferences(1,true);
  const [created]=await db.query(`INSERT INTO invoice("personId",issue_date,due_date,consumption_m_3,amount_due,status)
    VALUES(1,CURRENT_DATE,CURRENT_DATE+3,8,20000,'PENDING') RETURNING id`);
  await worker.tick();await worker.tick();
  assert.equal(sent.filter(s=>s.template?.name==='test_created').length,1);
  assert.equal(sent.filter(s=>s.template?.name==='test_due').length,1);passed('new invoice and due-soon use deduplicated templates');
  await db.query(`UPDATE invoice SET status='PAID' WHERE id=$1`,[created.id]);await worker.tick();await worker.tick();
  assert.equal(sent.filter(s=>s.template?.name==='test_paid').length,1);passed('payment state transition produces one confirmation');
  await db.query(`UPDATE invoice SET amount_due=21000 WHERE id=$1`,[created.id]);await worker.tick();
  assert.equal(sent.filter(s=>s.template?.name==='test_paid').length,1);passed('unrelated invoice updates do not create payment notices');
  await db.query(`INSERT INTO invoice("personId",issue_date,due_date,consumption_m_3,amount_due,status) VALUES(1,CURRENT_DATE,CURRENT_DATE+30,2,100,'PENDING')`);
  await worker.scheduleNotifications();await inbound('BAJA');await worker.tick();assert.equal((await accounts.status(1)).notifications,false);
  assert.equal(sent.filter(s=>s.template?.name==='test_created').length,1);passed('BAJA cancels queued notifications');
  await inbound('FACTURAS');const before=sent.length;await db.query("UPDATE person SET user_id=NULL WHERE id=1");await worker.tick();
  assert.equal(sent.length,before);await db.query("UPDATE person SET user_id='1' WHERE id=1");passed('ownership rechecked immediately before private send');
  const savedFetch=global.fetch;global.fetch=async()=>{throw new Error('simulated accepted-but-response-lost');};
  await inbound('CONSUMO');await worker.tick();global.fetch=savedFetch;
  const unknown=await db.query("SELECT * FROM whatsapp_outbox WHERE state='unknown'");assert.equal(unknown.length,1);assert.equal(unknown[0].body,null);
  const beforeRetry=sent.length;await worker.tick();assert.equal(sent.length,beforeRetry);passed('ambiguous provider outcome is not automatically replayed');
  const [receipt]=await db.query("SELECT provider_id,phone FROM whatsapp_outbox WHERE provider_id IS NOT NULL LIMIT 1");
  await assistant.delivery(receipt.provider_id,receipt.phone,'delivered');await assistant.delivery(receipt.provider_id,receipt.phone,'sent');
  assert.equal((await db.query('SELECT delivery_status FROM whatsapp_outbox WHERE provider_id=$1',[receipt.provider_id]))[0].delivery_status,'delivered');
  await assistant.delivery(receipt.provider_id,'573999999999','read');
  assert.equal((await db.query('SELECT delivery_status FROM whatsapp_outbox WHERE provider_id=$1',[receipt.provider_id]))[0].delivery_status,'delivered');passed('delivery receipts are monotonic and sender-bound');
  global.fetch=async()=>new Response(JSON.stringify({data:[{name:'test_created',status:'PENDING',language:'es',category:'UTILITY'}]}),{status:200});
  const pendingTemplates=new WhatsappTemplateService();assert.equal(await pendingTemplates.ready(),false);
  await assert.rejects(()=>new WhatsappAccountService(runtime,pendingTemplates).preferences(1,true));global.fetch=savedFetch;passed('pending templates cannot enable proactive notifications');
  await db.query("UPDATE whatsapp_link SET expires_at=now()-interval '1 minute' WHERE user_id=1");
  await inbound('FACTURAS');await worker.tick();assert(sent.at(-1).text.body.includes('primero vincula'));passed('expired link cannot disclose account data');
  await inbound('DESVINCULAR');assert.equal((await accounts.status(1)).linked,false);await worker.tick();
  await inbound('facturas');await worker.tick();assert(sent.at(-1).text.body.includes('primero vincula'));passed('unlink removes private access');
  // Empty signed envelopes validate without generating outbound messages.
  const webhook=new WhatsappService(assistant),body={object:'whatsapp_business_account',entry:[]};const raw=Buffer.from(JSON.stringify(body));
  await webhook.receive(body,raw,'sha256='+createHmac('sha256',process.env.WHATSAPP_APP_SECRET).update(raw).digest('hex'));
  await assert.rejects(()=>webhook.receive(body,raw,'sha256='+'0'.repeat(64)));passed('signature enforcement with assistant enabled');
  const {WhatsappAdminService}=require('../dist/service/whatsapp-admin.service');
  const {WhatsappAdminController}=require('../dist/web/rest/whatsapp-admin.controller');
  const {PortalController}=require('../dist/web/rest/portal.controller');
  const {RolesGuard}=require('../dist/security/guards/roles.guard');
  const {Reflector}=require('@nestjs/core');
  const roles=new RolesGuard(new Reflector());
  function access(controller,method,role){return roles.canActivate({getClass:()=>controller,getHandler:()=>controller.prototype[method],switchToHttp:()=>({getRequest:()=>({user:{authorities:[role]}})})});}
  for(const role of ['ROLE_USER','ROLE_OPERATOR']) for(const method of ['status','send']) assert.equal(access(WhatsappAdminController,method,role),false);
  assert.equal(access(WhatsappAdminController,'send','ROLE_ADMIN'),true);
  assert.equal(access(PortalController,'getDashboard','ROLE_ADMIN'),true);
  assert.equal(access(PortalController,'subscriber','ROLE_USER'),false);passed('admin-only test endpoints and inherited portal permissions');
  const admin=new WhatsappAdminService(runtime,templates);
  const request=(extra={})=>({phone:'+573000000001',type:'connection',consent:true,requestId:randomUUID(),...extra});
  await assert.rejects(()=>admin.send(2,request()));await assert.rejects(()=>admin.status(2));await assert.rejects(()=>admin.send(4,request()));
  await assert.rejects(()=>admin.send(1,request({consent:false})));await assert.rejects(()=>admin.send(1,request({phone:'123'})));
  await assert.rejects(()=>admin.send(1,request({type:'__proto__'})));await assert.rejects(()=>admin.send(1,request({phone:'+573000000009'})));passed('test validation, current admin role, consent and response window enforced');
  const test=request();const [first,second]=await Promise.all([admin.send(1,test),admin.send(1,test)]);assert.equal(first.id,second.id);
  await assert.rejects(()=>admin.send(1,{...test,type:'paid'}));await assert.rejects(()=>admin.send(1,request()));
  const sendsBefore=sent.length;await worker.tick();assert.equal(sent.length,sendsBefore+1);assert(sent.at(-1).text.body.startsWith('Prueba de conexión'));
  assert.equal(sent.at(-1).to,'573000000001');passed('test requests deduplicated, rate-limited and delivered with fixed safe content');
  const history=await admin.status(1);assert(history.history[0].phone==='•••• 0001');assert(!JSON.stringify(history).includes('573000000001'));passed('admin test history masks recipient and excludes credentials');
  const age=()=>db.query("UPDATE whatsapp_outbox SET created_at=now()-interval '1 minute' WHERE dedup_key LIKE 'admin-test:%'");
  for(const type of ['created','due','paid']){await age();await admin.send(1,request({type}));const n=sent.length;await worker.tick();assert.equal(sent.length,n+1);assert(sent.at(-1).template.name==='test_'+type);}
  passed('all three admin notification tests use approved templates without creating invoices');
  await age();await admin.send(1,request());await db.query('DELETE FROM jhi_user_authorities_jhi_authority WHERE "jhiUserId"=1');
  const revokedCount=sent.length;await worker.tick();assert.equal(sent.length,revokedCount);
  await db.query(`INSERT INTO jhi_user_authorities_jhi_authority VALUES(1,'ROLE_ADMIN')`);passed('revoked admin cannot send queued tests');
  await age();await assert.rejects(()=>new WhatsappAdminService(runtime,pendingTemplates).send(1,request({type:'created'})));passed('pending template test cannot enqueue');
  global.fetch=async()=>new Response(JSON.stringify({data:[{name:'test_created',status:'APPROVED',language:'es',category:'UTILITY',components:[{type:'BODY',text:'Synthetic preview'}]}]}),{status:200});
  const partial=new WhatsappTemplateService();assert.equal(await partial.ready(),false);assert.equal(await partial.readyFor('invoice.created'),true);assert.equal(await partial.readyFor('invoice.paid'),false);
  assert.equal((await partial.status())[0].body,'Synthetic preview');global.fetch=savedFetch;passed('individual approved template can be tested while other templates remain pending');
  // Check actual module dependency injection, not only direct construction.
  const {Module,Global}=require('@nestjs/common');const {NestFactory}=require('@nestjs/core');
  class TestDatabase{};Global()(TestDatabase);Module({providers:[{provide:DataSource,useValue:runtime}],exports:[DataSource]})(TestDatabase);
  class TestRoot{};Module({imports:[TestDatabase,WhatsappModule]})(TestRoot);
  const app=await NestFactory.createApplicationContext(TestRoot,{logger:false});await app.close();passed('Nest module dependency wiring');
  console.log(JSON.stringify({passed:count,syntheticOnly:true,realWhatsappMessages:0}));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(runtime?.isInitialized)await runtime.destroy();if(db.isInitialized)await db.destroy();});
