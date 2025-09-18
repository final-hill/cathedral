import { Migration } from '@mikro-orm/migrations'

export class Migration20250908163139 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop column "operation_id";`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_versions" add column "operation_id" varchar(255) null;`)
    }
}
