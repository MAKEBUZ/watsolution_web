import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { WhatsappAccounts1792819200000 } from './migrations/1792819200000-WhatsappAccounts';
import { migrationFailure } from './security/migration-diagnostics';

let stage = 'configuration';

async function main() {
  if (!process.env.MIGRATION_DATABASE_URL || process.env.MIGRATION_BACKUP_REVIEWED !== 'yes')
    throw new Error('Reviewed database and backup required');
  const db = new DataSource({
    type: 'postgres',
    url: process.env.MIGRATION_DATABASE_URL,
    synchronize: false,
    logging: false,
    migrations: [WhatsappAccounts1792819200000],
    migrationsTableName: 'watsolution_security_migrations',
  });
  stage = 'connection';
  await db.initialize();
  try {
    stage = 'apply';
    const result = await db.runMigrations({ transaction: 'all' });
    console.log(JSON.stringify({ applied: result.map(m => m.name) }));
  } finally {
    await db.destroy();
  }
}
main().catch(error => {
  console.error(JSON.stringify(migrationFailure(stage, error)));
  process.exitCode = 1;
});
