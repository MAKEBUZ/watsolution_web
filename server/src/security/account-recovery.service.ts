import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { User } from '../domain/user.entity';
import { AuthSession } from '../domain/auth-session.entity';
import { comparePassword, encodePassword } from './password-util';
import { assertPassword } from './password-policy';
import { LoginRateLimitService } from './login-rate-limit.service';
import { MfaService } from './mfa.service';

@Injectable()
export class AccountRecoveryService {
  private readonly log = new Logger('AccountSecurity');
  constructor(
    private readonly db: DataSource,
    private readonly limits: LoginRateLimitService,
    private readonly mfa: MfaService,
  ) {}
  private hash(key: string) {
    return createHash('sha256').update(key).digest('hex');
  }
  async issue(actorId: number, userId: number, password: unknown) {
    if (!Number.isSafeInteger(userId) || userId < 1) throw new BadRequestException();
    await this.limits.consumeBucket(`recovery-issue:${actorId}`, 5);
    const actor = await this.db.getRepository(User).findOne({ where: { id: actorId, activated: true }, relations: { authorities: true } });
    if (
      !actor?.authorities.some(r => r.name === 'ROLE_ADMIN') ||
      typeof password !== 'string' ||
      Buffer.byteLength(password) > 72 ||
      !(await comparePassword(password, actor.password))
    )
      throw new UnauthorizedException();
    const key = `${userId}.${randomBytes(32).toString('base64url')}`,
      hash = this.hash(key);
    await this.db.transaction(async manager => {
      const users = manager.getRepository(User);
      const user = await users.findOne({ where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      if (!user) throw new NotFoundException();
      user.resetKey = hash;
      user.resetDate = new Date();
      user.activationKey = user.activated ? null : hash;
      await users.save(user);
    });
    this.log.log(JSON.stringify({ event: 'recovery_issued', actorId, userId }));
    return { key, expiresInSeconds: 1800 };
  }
  async finish(body: any) {
    const key = body?.key;
    if (typeof key !== 'string' || !/^[1-9]\d{0,9}\.[A-Za-z0-9_-]{43}$/.test(key))
      throw new BadRequestException('Invalid or expired recovery link');
    assertPassword(body?.newPassword);
    const userId = Number(key.split('.')[0]),
      hash = this.hash(key);
    await this.limits.consumeBucket(`recovery-finish:${userId}`, 5);
    const preview = await this.db.getRepository(User).findOneBy({ id: userId });
    const valid = (user: User) =>
      user?.resetKey === hash &&
      user.resetDate &&
      Date.now() - user.resetDate.getTime() <= 1800000 &&
      user.resetDate.getTime() <= Date.now();
    if (!valid(preview)) throw new BadRequestException('Invalid or expired recovery link');
    assertPassword(body.newPassword, preview.login);
    await this.mfa.verifyLogin(userId, body.code);
    const password = await encodePassword(body.newPassword);
    await this.db.transaction(async manager => {
      const repo = manager.getRepository(User);
      const user = await repo.findOne({ where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      if (!valid(user)) throw new BadRequestException('Invalid or expired recovery link');
      user.password = password;
      if (user.activationKey === hash) user.activated = true;
      user.resetKey = null;
      user.activationKey = null;
      user.resetDate = null;
      await repo.save(user);
      await manager.getRepository(AuthSession).update({ userId }, { revoked: true });
    });
    this.log.log(JSON.stringify({ event: 'recovery_completed', userId }));
    return { completed: true };
  }
}
