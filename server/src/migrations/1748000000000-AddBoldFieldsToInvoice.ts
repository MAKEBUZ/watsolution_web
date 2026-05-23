import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoldFieldsToInvoice1748000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    for (const col of ['bold_order_id', 'bold_transaction_id']) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'invoice' AND column_name = '${col}'
          ) THEN
            ALTER TABLE "invoice" ADD COLUMN "${col}" VARCHAR(120);
          END IF;
        END$$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN IF EXISTS "bold_order_id"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN IF EXISTS "bold_transaction_id"`);
  }
}
