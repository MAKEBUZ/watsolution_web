import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1749100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          SERIAL PRIMARY KEY,
        user_login  VARCHAR(100)  NOT NULL,
        type        VARCHAR(50)   NOT NULL,
        title       VARCHAR(200)  NOT NULL,
        message     TEXT          NOT NULL,
        invoice_id  INTEGER,
        read        BOOLEAN       NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_login ON notifications(user_login)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
  }
}
