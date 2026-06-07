import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMeetingRemindersTable1749283300000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meeting_reminders" (
        "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
        "title"      VARCHAR(255) NOT NULL,
        "content"    TEXT         NOT NULL,
        "remind_at"  TIMESTAMPTZ  NOT NULL,
        "created_by" UUID         NOT NULL,
        "is_sent"    BOOLEAN      NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_meeting_reminders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_meeting_reminders_created_by"
          FOREIGN KEY ("created_by") REFERENCES "users"("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "meeting_reminders"`);
  }
}
