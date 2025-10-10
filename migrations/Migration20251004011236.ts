import { Migration } from '@mikro-orm/migrations'

export class Migration20251004011236 extends Migration {
    override async up(): Promise<void> {
    // First, clean up duplicate endorsements by keeping only the most recent one for each (requirement, endorsedBy) pair
        this.addSql(`
      DELETE FROM "endorsement" e1
      WHERE EXISTS (
        SELECT 1 FROM "endorsement" e2
        WHERE e2."requirement_id" = e1."requirement_id"
          AND e2."endorsed_by_id" = e1."endorsed_by_id"
          AND e2."id" > e1."id"
      );
    `)

        // Now add the unique constraint
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_id_endorsed_by_id_unique" unique ("requirement_id", "endorsed_by_id");`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_id_endorsed_by_id_unique";`)
    }
}
