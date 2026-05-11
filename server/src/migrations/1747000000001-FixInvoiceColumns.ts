import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInvoiceColumns1747000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const columns: { name: string; def: string }[] = [
      { name: 'rate_per_m3',        def: 'NUMERIC(10,2)' },
      { name: 'fixed_charge',       def: 'NUMERIC(10,2)' },
      { name: 'subsidy_percent',    def: 'NUMERIC(5,4)' },
      { name: 'additional_charges', def: 'NUMERIC(10,2)' },
      { name: 'pdf_url',            def: 'VARCHAR' },
    ];

    for (const col of columns) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'invoice' AND column_name = '${col.name}'
          ) THEN
            ALTER TABLE "invoice" ADD COLUMN "${col.name}" ${col.def};
          END IF;
        END$$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
