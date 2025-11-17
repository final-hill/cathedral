import { Migration } from '@mikro-orm/migrations'

export class Migration20251114164822 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "endorsement" drop constraint "endorsement_endorsed_by_id_foreign";`)

        this.addSql(`alter table "endorsement" drop column "check_type", drop column "retry_count";`)

        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" drop default;`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" type uuid using ("endorsed_by_id"::text::uuid);`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" drop not null;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_endorsed_by_id_foreign" foreign key ("endorsed_by_id") references "requirement" ("id") on update cascade on delete set null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "endorsement" drop constraint "endorsement_endorsed_by_id_foreign";`)

        this.addSql(`alter table "endorsement" add column "check_type" text check ("check_type" in ('spelling_grammar', 'readability_score', 'glossary_compliance', 'formal_language', 'type_correspondence')) null, add column "retry_count" int null;`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" drop default;`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" type uuid using ("endorsed_by_id"::text::uuid);`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" set not null;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_endorsed_by_id_foreign" foreign key ("endorsed_by_id") references "requirement" ("id") on update cascade;`)
    }
}
