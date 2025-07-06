import { Migration } from '@mikro-orm/migrations'

export class Migration20250704191414 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "slack_workspace_meta" drop column "is_active";`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "slack_workspace_meta" add column "is_active" boolean not null default true;`)
    }
}
