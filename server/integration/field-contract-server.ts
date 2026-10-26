// Loopback-only bridge for Flutter contract tests. Never imported by the application.
import 'reflect-metadata';
import express from 'express';
import { randomBytes, randomUUID, generateKeyPairSync } from 'crypto';
import { createBillingFixture } from './billing-fixture';
import { FieldBillingService } from '../src/service/field-billing.service';
import { MobileService } from '../src/service/mobile.service';
import { Person } from '../src/domain/person.entity';
import { Meter } from '../src/domain/meter.entity';
import { Invoice } from '../src/domain/invoice.entity';
import { PersonStatus } from '../src/domain/enumeration/person-status';

async function main() {
  if (process.env.BACKEND_ENV !== 'test' || process.env.WATSOLUTION_TEST_DATABASE !== 'local-disposable') throw new Error('Disposable test environment required');
  const fixture = await createBillingFixture();
  const db = fixture.db;
  const actor = { id: 2, login: 'contract-synthetic', authorities: ['ROLE_ADMIN'] } as any;
  const person = await db.getRepository(Person).save({ id: 7, fullName: 'Contract synthetic', documentNumber: randomUUID(), status: PersonStatus.ACTIVE });
  const previous = await db.getRepository(Meter).save({ person, waterMeasure: 100, readingDate: '2026-01-01' });
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  process.env.OFFLINE_SIGNING_KEY_BASE64 = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');
  const rawPublicKey = (publicKey.export({ format: 'jwk' }) as any).x;
  const token = randomBytes(32).toString('hex');
  const mobile = new MobileService(db), billing = new FieldBillingService(db, mobile);
  const app = express(); app.use(express.json({ limit: '20kb' }));
  app.get('/fixture', (_req, res) => { res.json({ token, publicKey: Buffer.from(rawPublicKey, 'base64url').toString('base64'), person: { id: person.id, fullName: person.fullName, previousMeterId: previous.id, previousReading: 100, previousDate: '2026-01-01', referencePrepared: true } }); });
  app.use((req, res, next) => { if (req.headers.authorization !== `Bearer ${token}`) { res.sendStatus(401); return; } next(); });
  const route = (work: (req: any) => any) => async (req, res) => {
    try { res.json(await work(req)); } catch (error) { res.status(error?.getStatus?.() ?? 500).json({ message: 'Synthetic contract request rejected' }); }
  };
  app.get('/api/account', route(() => actor));
  app.post('/api/mobile/permit', route(req => ({ permit: mobile.permit(actor, req.body.installationId) })));
  app.post('/api/mobile/access/check', route(req => mobile.access(actor, req.body.personIds)));
  app.post('/api/mobile/capture-billing', route(req => billing.capture(actor, req.body)));
  app.get('/fixture/counts', route(async () => ({ meters: await db.getRepository(Meter).count(), invoices: await db.getRepository(Invoice).count() })));
  const server = app.listen(58080, '127.0.0.1', () => console.log('Isolated Flutter contract server ready on loopback:58080'));
  const close = async () => { server.close(); await fixture.close(); process.exit(0); };
  process.once('SIGTERM', close); process.once('SIGINT', close);
}
main().catch(() => { console.error('Isolated Flutter contract startup failed'); process.exitCode = 1; });
