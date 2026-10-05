import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { AuthSession } from '../domain/auth-session.entity';

@Injectable()
export class SessionService {
  constructor(private readonly db: DataSource) {}
  private hash(token: string) { return createHash('sha256').update(token).digest('hex'); }

  async create(userId: number) {
    const id = randomUUID();
    const refreshToken = `${id}.${randomBytes(48).toString('base64url')}`;
    await this.db.getRepository(AuthSession).save({ id, userId, refreshHash: this.hash(refreshToken), expiresAt: new Date(Date.now() + 7 * 86400000), revoked: false });
    return { id, refreshToken };
  }

  async validate(id: string, userId: number) {
    if (!id) return false;
    const session = await this.db.getRepository(AuthSession).findOneBy({ id, userId, revoked: false });
    return !!session && session.expiresAt.getTime() > Date.now();
  }

  async rotate(token: string) {
    if (typeof token !== 'string' || token.length > 256 || !/^[0-9a-f-]{36}\.[A-Za-z0-9_-]{64}$/.test(token)) throw new UnauthorizedException();
    const id = token.split('.')[0];
    const replacement = `${id}.${randomBytes(48).toString('base64url')}`;
    const result = await this.db.transaction(async manager => {
      const repo = manager.getRepository(AuthSession);
      const session = await repo.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!session || session.revoked || session.expiresAt.getTime() <= Date.now()) return null;
      const supplied = this.hash(token);
      const used: string[] = JSON.parse(session.usedRefreshHashes || '[]');
      if (session.refreshHash !== supplied) {
        // Only a proven replay may revoke a family. Knowing a session ID is insufficient.
        if (used.includes(supplied)) { session.revoked = true; await repo.save(session); }
        return null;
      }
      if (used.length >= 1000) { session.revoked = true; await repo.save(session); return null; }
      used.push(supplied);
      session.usedRefreshHashes = JSON.stringify(used);
      session.refreshHash = this.hash(replacement);
      await repo.save(session);
      return { ...session, refreshToken: replacement };
    });
    if (!result) throw new UnauthorizedException();
    return result;
  }

  async revoke(id: string, userId: number) { await this.db.getRepository(AuthSession).update({ id, userId }, { revoked: true }); }
  async revokeAll(userId: number) { await this.db.getRepository(AuthSession).update({ userId }, { revoked: true }); }
}
