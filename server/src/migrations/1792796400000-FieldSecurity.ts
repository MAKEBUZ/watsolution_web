import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class FieldSecurity1792796400000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    const timestamp = q.connection.options.type === 'postgres' ? 'timestamp' : 'datetime';
    if (!(await q.hasColumn('auth_session', 'mfaVerified')))
      await q.addColumn('auth_session', new TableColumn({ name: 'mfaVerified', type: 'boolean', default: false }));
    if (!(await q.hasTable('account_mfa')))
      await q.createTable(
        new Table({
          name: 'account_mfa',
          columns: [
            { name: 'userId', type: 'integer', isPrimary: true },
            { name: 'enabled', type: 'boolean', default: false },
            { name: 'secretCipher', type: 'text', isNullable: true },
            { name: 'pendingCipher', type: 'text', isNullable: true },
            { name: 'pendingExpiresAt', type: timestamp, isNullable: true },
            { name: 'lastStep', type: 'bigint', default: -1 },
            { name: 'recoveryHashes', type: 'text', default: "'[]'" },
          ],
        }),
      );
    if (!(await q.hasTable('billing_tariff')))
      await q.createTable(
        new Table({
          name: 'billing_tariff',
          columns: [
            { name: 'id', type: 'varchar', length: '36', isPrimary: true },
            { name: 'rate', type: 'decimal', precision: 10, scale: 2 },
            { name: 'fixedCharge', type: 'decimal', precision: 10, scale: 2 },
            { name: 'createdAt', type: q.connection.options.type === 'postgres' ? 'timestamp' : 'datetime' },
            { name: 'createdBy', type: 'varchar' },
          ],
        }),
      );
  }
  async down(): Promise<void> {
    throw new Error('Destructive rollback disabled; preserve offline tariff references.');
  }
}
