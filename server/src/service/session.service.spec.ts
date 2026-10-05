import { createHash, randomBytes, randomUUID } from 'crypto';
import { SessionService } from './session.service';
describe('Refresh rotation', () => {
  const hash = (s: string) => createHash('sha256').update(s).digest('hex');
  function fixture() {
    const id = randomUUID(); const token = `${id}.${randomBytes(48).toString('base64url')}`;
    const row = { id, userId: 2, revoked: false, refreshHash: hash(token), usedRefreshHashes: '[]', expiresAt: new Date(Date.now() + 60000) };
    const repo = { findOne: jest.fn(async () => row), save: jest.fn(async value => value) };
    const db = { transaction: async fn => fn({ getRepository: () => repo }) };
    return { token, row, repo, service: new SessionService(db as any) };
  }
  it('replaces the token, stores only digests, and locks the row', async () => {
    const f = fixture(); const result = await f.service.rotate(f.token);
    expect(result.refreshToken).not.toBe(f.token);
    expect(f.row.refreshHash).toBe(hash(result.refreshToken));
    expect(f.row.usedRefreshHashes).not.toContain(f.token);
    expect(f.repo.findOne).toHaveBeenCalledWith(expect.objectContaining({ lock: { mode: 'pessimistic_write' } }));
  });
  it('commits family revocation on proven replay', async () => {
    const f = fixture(); await f.service.rotate(f.token);
    await expect(f.service.rotate(f.token)).rejects.toThrow();
    expect(f.row.revoked).toBe(true); expect(f.repo.save).toHaveBeenCalledTimes(2);
  });
  it('does not allow a guessed token to revoke a known session id', async () => {
    const f = fixture(); const invalid = `${f.row.id}.${randomBytes(48).toString('base64url')}`;
    await expect(f.service.rotate(invalid)).rejects.toThrow(); expect(f.row.revoked).toBe(false); expect(f.repo.save).not.toHaveBeenCalled();
  });
  it('rejects expired sessions', async () => {
    const f = fixture(); f.row.expiresAt = new Date(0);
    await expect(f.service.rotate(f.token)).rejects.toThrow(); expect(f.repo.save).not.toHaveBeenCalled();
  });
  it('revokes by refresh without an access token and tolerates repeated logout', async () => {
    const f = fixture();
    await f.service.revokeByRefresh(f.token);
    await f.service.revokeByRefresh(f.token);
    expect(f.row.revoked).toBe(true);
    expect(f.repo.save).toHaveBeenCalledTimes(1);
    await expect(f.service.rotate(f.token)).rejects.toThrow();
  });
  it('revokes the family when a refresh won the lock before logout', async () => {
    const f = fixture(); const replacement = await f.service.rotate(f.token);
    await f.service.revokeByRefresh(f.token);
    await expect(f.service.rotate(replacement.refreshToken)).rejects.toThrow();
    expect(f.row.revoked).toBe(true);
  });
  it('does not revoke a guessed refresh secret', async () => {
    const f = fixture();
    await f.service.revokeByRefresh(`${f.row.id}.${randomBytes(48).toString('base64url')}`);
    expect(f.row.revoked).toBe(false);
    expect(f.repo.save).not.toHaveBeenCalled();
  });
  it.each(['', 'invalid', undefined])('ignores absent or malformed refresh %s', async token => {
    const f = fixture(); await f.service.revokeByRefresh(token);
    expect(f.repo.findOne).not.toHaveBeenCalled();
  });
});
