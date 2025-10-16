import { Migration } from '@mikro-orm/migrations'

export class Migration20250907160950 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_format_check";`)

        this.addSql(`alter table "requirement_versions" drop column "definition";`)

        this.addSql(`alter table "requirement_versions" add column "schema" jsonb null;`)
        this.addSql(`alter table "requirement_versions" alter column "format" type varchar(255) using ("format"::varchar(255));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop column "schema";`)

        this.addSql(`alter table "requirement_versions" add column "definition" text null;`)
        this.addSql(`alter table "requirement_versions" alter column "format" type text using ("format"::text);`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_format_check" check("format" in ('JSON_SCHEMA'));`)
    }
}
