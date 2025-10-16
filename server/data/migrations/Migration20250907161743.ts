import { Migration } from '@mikro-orm/migrations'

export class Migration20250907161743 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop column "schema_name";`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_versions" add column "schema_name" varchar(255) null;`)
    }
}
