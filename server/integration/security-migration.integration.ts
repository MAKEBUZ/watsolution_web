import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { createBillingFixture } from './billing-fixture';
import { SecureMobile1791158400000 } from '../src/migrations/1791158400000-SecureMobile';
import { AuthService } from '../src/service/auth.service';
import { SessionService } from '../src/service/session.service';
import { UserService } from '../src/service/user.service';
import { LoginRateLimitService } from '../src/security/login-rate-limit.service';
import { encodePassword } from '../src/security/password-util';
import { User } from '../src/domain/user.entity';
import { Authority } from '../src/domain/authority.entity';
import { AuthSession } from '../src/domain/auth-session.entity';

describe('Security migration on an existing application database', () => {
  it('repairs missing login tables, preserves existing users and supports repeated execution', async () => {
    // The fixture rejects every target except the explicitly disposable loopback database.
    const fixture = await createBillingFixture();
    const { db, schema } = fixture;
    const runner = db.createQueryRunner();
    try {
      const password = randomBytes(24).toString('base64url');
      const users = db.getRepository(User);
      await db.getRepository(Authority).save({ name: 'ROLE_USER' });
      const user = await users.save({
        login: 'migration-test',
        email: 'migration@example.invalid',
        activated: true,
        password: await encodePassword(password),
        authorities: [{ name: 'ROLE_USER' }],
      });
      const before = await users.findOneByOrFail({ id: user.id });

      // Simulate the pre-security schema, only inside this fixture's random test schema.
      await db.query(`DROP TABLE "${schema}".auth_rate_limit, "${schema}".auth_session, "${schema}".mobile_operation`);
      await db.query(`ALTER TABLE "${schema}".person DROP COLUMN assigned_operator_id`);
      const limiter = new LoginRateLimitService(db);
      await expect(limiter.consume(user.login)).rejects.toMatchObject({ code: '42P01' });

      const migration = new SecureMobile1791158400000();
      for (let attempt = 0; attempt < 2; attempt++) {
        await runner.startTransaction();
        try {
          await migration.up(runner);
          await runner.commitTransaction();
        } catch (error) {
          await runner.rollbackTransaction();
          throw error;
        }
      }
      expect(await users.findOneByOrFail({ id: user.id })).toEqual(before);
      expect(await runner.hasTable('auth_rate_limit')).toBe(true);
      expect(await runner.hasTable('auth_session')).toBe(true);
      expect(await runner.hasTable('mobile_operation')).toBe(true);
      expect(await runner.hasColumn('person', 'assigned_operator_id')).toBe(true);
      expect(await db.getRepository(Authority).countBy({ name: 'ROLE_OPERATOR' })).toBe(1);

      const sessions = new SessionService(db);
      const auth = new AuthService(
        new JwtService({ secret: randomBytes(48) }),
        sessions,
        limiter,
        db.getRepository(Authority),
        new UserService(users),
      );
      const login = await auth.login({ username: user.login, password });
      expect(typeof login.id_token).toBe('string');
      expect(await db.getRepository(AuthSession).countBy({ userId: user.id, revoked: false })).toBe(1);
      const renewed = await auth.refresh(login.refresh_token);
      expect(renewed.refresh_token).not.toBe(login.refresh_token);
      await sessions.revokeByRefresh(renewed.refresh_token);
      expect(await db.getRepository(AuthSession).countBy({ userId: user.id, revoked: false })).toBe(0);
    } finally {
      await runner.release();
      await fixture.close();
    }
  });
});
