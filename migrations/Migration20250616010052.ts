import { Migration } from '@mikro-orm/migrations'

export class Migration20250616010052 extends Migration {
    override async up(): Promise<void> {
    // Add columns with default values first
        this.addSql(`alter table "slack_channel_meta" add column "channel_name" varchar(255) not null default '';`)
        this.addSql(`alter table "slack_channel_meta" add column "team_name" varchar(255) not null default '';`)

        // For existing rows, set channel_name and team_name to the respective IDs as fallback
        this.addSql(`update "slack_channel_meta" set "channel_name" = "channel_id", "team_name" = "team_id" where "channel_name" = '' or "team_name" = '';`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "slack_channel_meta" drop column "channel_name", drop column "team_name";`)
    }
}
