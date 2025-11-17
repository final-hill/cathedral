import { Migration } from '@mikro-orm/migrations'

export class Migration20251111212034_add_glossary_term_fulltext_search extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" add column "searchable_name" tsvector null;`)
        this.addSql(`create index "requirement_versions_searchable_name_index" on "public"."requirement_versions" using gin("searchable_name");`)
    }

    override async down(): Promise<void> {
        this.addSql(`drop index "requirement_versions_searchable_name_index";`)
        this.addSql(`alter table "requirement_versions" drop column "searchable_name";`)
    }
}
