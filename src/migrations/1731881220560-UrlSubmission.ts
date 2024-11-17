import { MigrationInterface, QueryRunner } from "typeorm";

export class UrlSubmission1731881220560 implements MigrationInterface {
  name = "UrlSubmission1731881220560";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "url_submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, CONSTRAINT "UQ_1e338fafc465e227dd03e53dff6" UNIQUE ("url"), CONSTRAINT "PK_d6f50620ff230078e177408f86e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "url_submission"`);
  }
}
