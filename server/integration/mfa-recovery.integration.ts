import { randomBytes } from 'crypto';
import { TOTP } from 'otpauth';
import { createBillingFixture } from './billing-fixture';
import { MfaService } from '../src/security/mfa.service';
import { AccountRecoveryService } from '../src/security/account-recovery.service';
import { LoginRateLimitService } from '../src/security/login-rate-limit.service';
import { User } from '../src/domain/user.entity';
import { Authority } from '../src/domain/authority.entity';
import { AccountMfa } from '../src/domain/account-mfa.entity';
import { encodePassword, comparePassword } from '../src/security/password-util';
import { SessionService } from '../src/service/session.service';

describe('MFA and one-use recovery on isolated PostgreSQL', () => {
  let f: Awaited<ReturnType<typeof createBillingFixture>>;
  let mfa: MfaService, recovery: AccountRecoveryService;
  const original = process.env.MFA_ENCRYPTION_KEY_BASE64;
  const password = 'Synthetic-password-only-2026';
  let user: User, admin: User;
  beforeAll(async () => {
    process.env.MFA_ENCRYPTION_KEY_BASE64 = randomBytes(32).toString('base64');
    f = await createBillingFixture();
    const limits = new LoginRateLimitService(f.db);
    mfa = new MfaService(f.db, limits);
    recovery = new AccountRecoveryService(f.db, limits, mfa);
    await f.db.getRepository(Authority).save({ name: 'ROLE_ADMIN' });
    user = await f.db
      .getRepository(User)
      .save({ login: 'mfa-test', email: 'mfa@example.invalid', password: await encodePassword(password), activated: true });
    admin = await f.db
      .getRepository(User)
      .save({
        login: 'admin-test',
        email: 'admin@example.invalid',
        password: await encodePassword(password),
        activated: true,
        authorities: [{ name: 'ROLE_ADMIN' }],
      });
  });
  afterAll(async () => {
    await f?.close();
    if (original === undefined) delete process.env.MFA_ENCRYPTION_KEY_BASE64;
    else process.env.MFA_ENCRYPTION_KEY_BASE64 = original;
  });
  it('requires password for enrollment, encrypts the secret, rejects replay and atomically consumes recovery codes', async () => {
    await expect(mfa.setup(user.id, 'wrong')).rejects.toThrow();
    const enrollment = await mfa.setup(user.id, password);
    const pending = await f.db.getRepository(AccountMfa).findOneBy({ userId: user.id });
    expect(pending.pendingCipher).not.toContain(enrollment.secret);
    const session = await new SessionService(f.db).create(user.id);
    const code = new TOTP({ secret: enrollment.secret }).generate();
    const confirmed = await mfa.confirm(user.id, code);
    expect(await new SessionService(f.db).validate(session.id, user.id)).toBe(false);
    await expect(mfa.verifyLogin(user.id, code)).rejects.toThrow();
    await expect(mfa.verifyLogin(user.id, undefined)).rejects.toThrow();
    const simultaneous = await Promise.allSettled([
      mfa.verifyLogin(user.id, confirmed.recoveryCodes[0]),
      mfa.verifyLogin(user.id, confirmed.recoveryCodes[0]),
    ]);
    expect(simultaneous.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const row = await f.db.getRepository(AccountMfa).findOneBy({ userId: user.id });
    expect(row.recoveryHashes).not.toContain(confirmed.recoveryCodes[1]);
    const link = await recovery.issue(admin.id, user.id, password);
    await expect(recovery.finish({ key: link.key, newPassword: 'New-synthetic-password-2026' })).rejects.toThrow();
    await recovery.finish({ key: link.key, newPassword: 'New-synthetic-password-2026', code: confirmed.recoveryCodes[1] });
    expect(await mfa.enabled(user.id)).toBe(true);
    await expect(
      recovery.finish({ key: link.key, newPassword: 'New-synthetic-password-2026', code: confirmed.recoveryCodes[2] }),
    ).rejects.toThrow();
  });
  it('activates an invited account once, expires links and does not expose stored recovery tokens', async () => {
    const invited = await f.db
      .getRepository(User)
      .save({ login: 'invited', email: 'invited@example.invalid', password: await encodePassword(password), activated: false });
    const link = await recovery.issue(admin.id, invited.id, password);
    expect((await f.db.getRepository(User).findOneBy({ id: invited.id })).resetKey).not.toBe(link.key);
    await recovery.finish({ key: link.key, newPassword: 'Invite-password-2026' });
    const result = await f.db.getRepository(User).findOneBy({ id: invited.id });
    expect(result.activated).toBe(true);
    expect(result.resetKey).toBeNull();
    expect(await comparePassword('Invite-password-2026', result.password)).toBe(true);
    await expect(recovery.finish({ key: link.key, newPassword: 'Invite-password-2026' })).rejects.toThrow();
    const expired = await recovery.issue(admin.id, invited.id, password);
    await f.db.getRepository(User).update(invited.id, { resetDate: new Date(Date.now() - 1801000) });
    await expect(recovery.finish({ key: expired.key, newPassword: 'Invite-password-2026' })).rejects.toThrow();
  });
});
