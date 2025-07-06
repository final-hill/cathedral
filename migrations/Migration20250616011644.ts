import { Migration } from '@mikro-orm/migrations'

export class Migration20250616011644 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "slack_channel_meta" add column "last_name_refresh" timestamptz null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "slack_channel_meta" drop column "last_name_refresh";`)
    }
}
