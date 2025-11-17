import { Migration } from '@mikro-orm/migrations'

export class Migration20251114170132 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "endorsement" drop column "automated_check";`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "endorsement" add column "automated_check" boolean null;`)
    }
}
