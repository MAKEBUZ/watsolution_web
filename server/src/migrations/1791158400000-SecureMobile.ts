import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class SecureMobile1791158400000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    const dateType = q.connection.options.type === 'postgres' ? 'timestamp' : 'datetime';
    if (!(await q.hasTable('auth_rate_limit'))) await q.createTable(new Table({ name: 'auth_rate_limit', columns: [
      { name: 'key', type: 'varchar', length: '64', isPrimary: true },
      { name: 'attempts', type: 'integer' }, { name: 'expires_at', type: 'bigint' },
    ] }));
    if (!(await q.hasTable('auth_session'))) await q.createTable(new Table({ name: 'auth_session', columns: [
      { name: 'id', type: 'varchar', length: '36', isPrimary: true }, { name: 'userId', type: 'integer' },
      { name: 'refreshHash', type: 'varchar', length: '64' }, { name: 'expiresAt', type: dateType },
      { name: 'usedRefreshHashes', type: 'text', default: "'[]'" },
      { name: 'revoked', type: 'boolean', default: false },
    ] }));
    if (!(await q.hasColumn('person', 'assigned_operator_id'))) await q.addColumn('person', new TableColumn({ name: 'assigned_operator_id', type: 'integer', isNullable: true }));
    if (!(await q.hasTable('mobile_operation'))) await q.createTable(new Table({ name: 'mobile_operation', columns: [
      { name: 'id', type: 'varchar', length: '36', isPrimary: true }, { name: 'userId', type: 'integer', isPrimary: true },
      { name: 'payloadHash', type: 'varchar', length: '64' }, { name: 'personId', type: 'integer' },
      { name: 'result', type: 'text' }, { name: 'createdAt', type: dateType },
    ] }));
    await q.query(`INSERT INTO jhi_authority (name) SELECT 'ROLE_OPERATOR' WHERE NOT EXISTS (SELECT 1 FROM jhi_authority WHERE name = 'ROLE_OPERATOR')`);
  }
  async down(): Promise<void> {
    throw new Error('Use a reviewed forward migration; destructive rollback is disabled.');
  }
}
