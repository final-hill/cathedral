import { Migration } from '@mikro-orm/migrations'

export class Migration20251111191806 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "endorsement" add column "automated_check" boolean null, add column "check_type" text check ("check_type" in ('spelling_grammar', 'readability_score', 'glossary_compliance', 'formal_language', 'type_correspondence')) null, add column "check_details" jsonb null, add column "retry_count" int null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "endorsement" drop column "automated_check", drop column "check_type", drop column "check_details", drop column "retry_count";`)
    }
}
