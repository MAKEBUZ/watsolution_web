import { MigrationInterface, QueryRunner, Table } from 'typeorm';
export class AdminExperience1792882800000 implements MigrationInterface {
  async up(q: QueryRunner) {
    if (!(await q.hasTable('testimonial')))
      await q.createTable(
        new Table({
          name: 'testimonial',
          columns: [
            { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'name', type: 'varchar', length: '120' },
            { name: 'role', type: 'varchar', length: '120' },
            { name: 'company', type: 'varchar', length: '160' },
            { name: 'text', type: 'text' },
            { name: 'published', type: 'boolean', default: false },
            { name: 'position', type: 'integer', default: 0 },
            { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          ],
        }),
      );
    if (q.connection.options.type === 'postgres') {
      await q.query('ALTER TABLE address ALTER COLUMN latitude TYPE numeric(10,7), ALTER COLUMN longitude TYPE numeric(10,7)');
    }
  }
  down(): Promise<void> {
    return Promise.reject(new Error('Restore the reviewed backup; coordinates must not be rounded back to two decimals.'));
  }
}
