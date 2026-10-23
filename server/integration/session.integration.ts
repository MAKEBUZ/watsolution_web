import { DataSource } from 'typeorm';
import { randomUUID, randomBytes } from 'crypto';
import { AuthSession } from '../src/domain/auth-session.entity';
import { SessionService } from '../src/service/session.service';
import { integrationTarget } from './target';

describe('Session lifecycle on disposable PostgreSQL', () => {
  let db: DataSource;
  let sessions: SessionService;
  const schema = `ws_test_${randomUUID().replace(/-/g, '')}`;
  let created = false;
  beforeAll(async () => {
    const target = integrationTarget(); // Reject before constructing or opening a connection.
    db = new DataSource({ type: 'postgres', ...target, schema, entities: [AuthSession],
      synchronize: false, migrationsRun: false, dropSchema: false, logging: false,
      extra: { connectionTimeoutMillis: 5000, max: 4 } });
    await db.initialize();
    const [identity] = await db.query('SELECT current_database() AS db, current_user AS role');
    if (identity.db !== 'ws_integration' || identity.role !== 'ws_test') throw new Error('Unexpected database identity');
    await db.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    await db.query(`CREATE TABLE "${schema}".auth_session (
      id varchar(36) PRIMARY KEY, "userId" integer NOT NULL, "refreshHash" varchar(64) NOT NULL,
      "usedRefreshHashes" text NOT NULL DEFAULT '[]', "expiresAt" timestamp NOT NULL,
      revoked boolean NOT NULL DEFAULT false
    )`);
    sessions = new SessionService(db);
  });
  afterAll(async () => {
    if (!db?.isInitialized) return;
    try {
      if (created && /^ws_test_[a-f0-9]{32}$/.test(schema)) await db.query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally { await db.destroy(); }
  });
  it('revokes and cannot renew the revoked refresh', async () => {
    const session = await sessions.create(1);
    await sessions.revokeByRefresh(session.refreshToken);
    await sessions.revokeByRefresh(session.refreshToken);
    expect(await sessions.validate(session.id, 1)).toBe(false);
    await expect(sessions.rotate(session.refreshToken)).rejects.toThrow();
  });
  it('does not revoke another family by guessing its id', async () => {
    const session = await sessions.create(2);
    await sessions.revokeByRefresh(`${session.id}.${randomBytes(48).toString('base64url')}`);
    expect(await sessions.validate(session.id, 2)).toBe(true);
  });
  it('serializes concurrent rotation and logout, leaving no live family', async () => {
    for (let i = 0; i < 10; i++) {
      const session = await sessions.create(100 + i);
      const [rotation, logout] = await Promise.allSettled([
        sessions.rotate(session.refreshToken), sessions.revokeByRefresh(session.refreshToken),
      ]);
      expect(logout.status).toBe('fulfilled');
      expect(await sessions.validate(session.id, 100 + i)).toBe(false);
      if (rotation.status === 'fulfilled') await expect(sessions.rotate(rotation.value.refreshToken)).rejects.toThrow();
    }
  });
});
