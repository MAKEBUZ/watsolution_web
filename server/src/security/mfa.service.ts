import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Secret, TOTP } from 'otpauth';
import { AccountMfa } from '../domain/account-mfa.entity';
import { AuthSession } from '../domain/auth-session.entity';
import { User } from '../domain/user.entity';
import { comparePassword } from './password-util';
import { LoginRateLimitService } from './login-rate-limit.service';

@Injectable()
export class MfaService {
  private readonly log = new Logger('AccountSecurity');
  constructor(
    private readonly db: DataSource,
    private readonly limits: LoginRateLimitService,
  ) {}
  private key() {
    const value = process.env.MFA_ENCRYPTION_KEY_BASE64;
    const key = value ? Buffer.from(value, 'base64') : null;
    if (!key || key.length !== 32) throw new ServiceUnavailableException('Account security configuration unavailable');
    return key;
  }
  private seal(userId: number, value: string) {
    const iv = randomBytes(12),
      cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    cipher.setAAD(Buffer.from(`watsolution:mfa:${userId}`));
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map(b => b.toString('base64')).join('.');
  }
  private open(userId: number, value: string) {
    try {
      const [iv, tag, encrypted] = value.split('.').map(s => Buffer.from(s, 'base64'));
      const cipher = createDecipheriv('aes-256-gcm', this.key(), iv);
      cipher.setAAD(Buffer.from(`watsolution:mfa:${userId}`));
      cipher.setAuthTag(tag);
      return Buffer.concat([cipher.update(encrypted), cipher.final()]).toString('utf8');
    } catch {
      throw new ServiceUnavailableException('Account security configuration unavailable');
    }
  }
  private totp(secret: string, label = 'Cuenta') {
    return new TOTP({ issuer: 'WatSolution', label, secret, algorithm: 'SHA1', digits: 6, period: 30 });
  }
  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
  async enabled(userId: number) {
    return !!(await this.db.getRepository(AccountMfa).findOneBy({ userId }))?.enabled;
  }
  async status(userId: number) {
    const row = await this.db.getRepository(AccountMfa).findOneBy({ userId });
    let available = true;
    try {
      this.key();
    } catch {
      available = false;
    }
    return { enabled: !!row?.enabled, available, recoveryRemaining: row?.enabled ? JSON.parse(row.recoveryHashes).length : 0 };
  }
  private async password(userId: number, password: unknown) {
    await this.limits.consumeBucket(`mfa-password:${userId}`, 5);
    if (typeof password !== 'string' || Buffer.byteLength(password) > 72) throw new UnauthorizedException();
    const user = await this.db.getRepository(User).findOneBy({ id: userId, activated: true });
    if (!user || !(await comparePassword(password, user.password))) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
  async setup(userId: number, password: unknown) {
    const user = await this.password(userId, password);
    const secret = new Secret({ size: 20 }).base32;
    const encrypted = this.seal(userId, secret);
    await this.db.transaction(async manager => {
      await manager.getRepository(User).findOne({ where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      const repo = manager.getRepository(AccountMfa);
      const row = await repo.findOneBy({ userId });
      if (row?.enabled) throw new ConflictException('MFA already enabled');
      await repo.save({ ...row, userId, enabled: false, pendingCipher: encrypted, pendingExpiresAt: new Date(Date.now() + 10 * 60000) });
    });
    return { secret, uri: this.totp(secret, user.login).toString(), expiresInSeconds: 600 };
  }
  private consume(row: AccountMfa, token: unknown, secret: string, recovery: boolean): boolean {
    if (typeof token !== 'string' || token.length > 64) return false;
    if (/^\d{6}$/.test(token)) {
      const now = Date.now(),
        totp = this.totp(secret);
      const delta = totp.validate({ token, window: 1, timestamp: now });
      const step = Math.floor(now / 30000) + (delta ?? 0);
      if (delta === null || step <= Number(row.lastStep)) return false;
      row.lastStep = step;
      return true;
    }
    if (!recovery) return false;
    const hashes: string[] = JSON.parse(row.recoveryHashes);
    const index = hashes.indexOf(this.hash(token.trim().toUpperCase()));
    if (index < 0) return false;
    hashes.splice(index, 1);
    row.recoveryHashes = JSON.stringify(hashes);
    return true;
  }
  private async invalidateSessions(manager: EntityManager, userId: number) {
    await manager.getRepository(AuthSession).update({ userId }, { revoked: true });
  }
  async confirm(userId: number, token: unknown) {
    await this.limits.consumeBucket(`mfa-token:${userId}`, 5);
    const recoveryCodes = Array.from({ length: 10 }, () => randomBytes(16).toString('hex').toUpperCase());
    await this.db.transaction(async manager => {
      const repo = manager.getRepository(AccountMfa);
      const row = await repo.findOne({ where: { userId }, lock: { mode: 'pessimistic_write' } });
      if (!row || row.enabled || !row.pendingCipher || row.pendingExpiresAt.getTime() <= Date.now())
        throw new BadRequestException('Enrollment expired');
      if (!this.consume(row, token, this.open(userId, row.pendingCipher), false)) throw new UnauthorizedException('Invalid security code');
      row.secretCipher = row.pendingCipher;
      row.pendingCipher = null;
      row.pendingExpiresAt = null;
      row.enabled = true;
      row.recoveryHashes = JSON.stringify(recoveryCodes.map(code => this.hash(code)));
      await repo.save(row);
      await this.invalidateSessions(manager, userId);
    });
    this.log.log(JSON.stringify({ event: 'mfa_enabled', userId }));
    return { recoveryCodes, signInRequired: true };
  }
  async verifyLogin(userId: number, token: unknown): Promise<boolean> {
    return this.db.transaction(async manager => {
      const repo = manager.getRepository(AccountMfa);
      const row = await repo.findOne({ where: { userId }, lock: { mode: 'pessimistic_write' } });
      if (!row?.enabled) return false;
      if (!this.consume(row, token, this.open(userId, row.secretCipher), true)) {
        throw new UnauthorizedException({ statusCode: 401, code: 'MFA_REQUIRED', message: 'Security code required or invalid' });
      }
      await repo.save(row);
      return true;
    });
  }
  async disable(userId: number, password: unknown, token: unknown) {
    await this.password(userId, password);
    await this.limits.consumeBucket(`mfa-token:${userId}`, 5);
    await this.db.transaction(async manager => {
      const repo = manager.getRepository(AccountMfa);
      const row = await repo.findOne({ where: { userId }, lock: { mode: 'pessimistic_write' } });
      if (!row?.enabled || !this.consume(row, token, this.open(userId, row.secretCipher), true))
        throw new UnauthorizedException('Invalid security code');
      await repo.delete({ userId });
      await this.invalidateSessions(manager, userId);
    });
    this.log.log(JSON.stringify({ event: 'mfa_disabled', userId }));
    return { signInRequired: true };
  }
}
