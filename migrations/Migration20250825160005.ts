import { Migration } from '@mikro-orm/migrations'

export class Migration20250825160005 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" add column "parent_step_id" uuid null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_parent_step_id_foreign" foreign key ("parent_step_id") references "requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "requirement_versions" drop column "step_number";`)

        this.addSql(`alter table "requirement_versions" add column "order" int null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint "requirement_parent_step_id_foreign";`)

        this.addSql(`alter table "requirement" drop column "parent_step_id";`)

        this.addSql(`alter table "requirement_versions" drop column "order";`)

        this.addSql(`alter table "requirement_versions" add column "step_number" varchar(255) null;`)
    }
}
