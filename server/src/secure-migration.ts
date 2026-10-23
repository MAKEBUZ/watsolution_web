import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SecureMobile1791158400000 } from './migrations/1791158400000-SecureMobile';

/** Explicit, additive migration entry point. Does not load historical synchronize migrations. */
async function main() {
  const url = process.env.MIGRATION_DATABASE_URL;
  if (!url) throw new Error('Set MIGRATION_DATABASE_URL explicitly for the reviewed target');
  const target = new URL(url);
  if (!['postgres:', 'postgresql:'].includes(target.protocol)) throw new Error('PostgreSQL is required');
  const db = new DataSource({ type: 'postgres', url, synchronize: false, migrationsRun: false, logging: false,
    migrations: [SecureMobile1791158400000], migrationsTableName: 'watsolution_security_migrations',
    ssl: process.env.MIGRATION_TLS === 'required' ? { rejectUnauthorized: true } : undefined,
  });
  await db.initialize();
  try {
    const q = db.createQueryRunner();
    try { if (!await q.hasTable('person') || !await q.hasTable('jhi_authority')) throw new Error('Existing application schema is required'); }
    finally { await q.release(); }
    if (!process.argv.includes('--apply')) { console.log('Target reachable. Check completed; no schema changes applied.'); return; }
    if (process.env.MIGRATION_BACKUP_REVIEWED !== 'yes') throw new Error('Review backup and staging evidence before applying');
    const completed = await db.runMigrations({ transaction: 'all' });
    console.log('Applied security migrations:', completed.map(m => m.name).join(', ') || 'already current');
  } finally { await db.destroy(); }
}
main().catch(() => { console.error('Security migration did not complete. Check target, permissions, schema and required variables; connection details are not logged.'); process.exitCode = 1; });
