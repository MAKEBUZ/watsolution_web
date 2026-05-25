import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentEmbeddings1749000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS document_embeddings (
        id        SERIAL PRIMARY KEY,
        content   TEXT        NOT NULL,
        embedding vector(1536),
        metadata  JSONB       NOT NULL DEFAULT '{}',
        created_at TIMESTAMP  NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS document_embeddings`);
  }
}
