import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceRateFields1747000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    if (process.env.BACKEND_ENV === 'prod' || process.env.BACKEND_ENV === 'dev') {
      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction();
      }
    }

    await queryRunner.connection.synchronize();
  }

  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<any> {}
}
