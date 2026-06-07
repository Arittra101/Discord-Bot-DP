import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1749283200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // No-op if enum already exists (pre-existing DB with "user_role" type)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_role_enum" AS ENUM ('admin', 'user');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
        "email"         VARCHAR(255) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "discord_id"    VARCHAR(64)  NOT NULL,
        "name"          VARCHAR(100) NOT NULL,
        "role"          "users_role_enum" NOT NULL DEFAULT 'user',
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id"         PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email"      UNIQUE ("email"),
        CONSTRAINT "UQ_users_discord_id" UNIQUE ("discord_id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}
