import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LoginRateLimitService {
  constructor(private readonly db: DataSource) {}

  @Cron('0 0 * * * *')
  async purgeExpired() {
    await this.db.query('DELETE FROM auth_rate_limit WHERE expires_at < $1', [Date.now() - 86400000]);
  }

  async consume(login: string) {
    const key = createHash('sha256').update(login.trim().toLowerCase()).digest('hex');
    const now = Date.now();
    // PostgreSQL serializes this UPSERT across replicas; no password or username is stored.
    const rows = await this.db.query(
      `INSERT INTO auth_rate_limit (key, attempts, expires_at) VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE SET
       attempts = CASE WHEN auth_rate_limit.expires_at <= $3 THEN 1 ELSE auth_rate_limit.attempts + 1 END,
       expires_at = CASE WHEN auth_rate_limit.expires_at <= $3 THEN $2 ELSE auth_rate_limit.expires_at END
       RETURNING attempts`, [key, now + 60000, now]);
    if (Number(rows[0].attempts) > 10) throw new HttpException('Too many attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
  }
}
