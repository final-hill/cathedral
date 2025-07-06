import { Migration } from '@mikro-orm/migrations'

export class Migration20250424020123 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop column if exists "workflow_state";`)
        this.addSql(`alter table "requirement_versions" add column "workflow_state" text check ("workflow_state" in ('Proposed', 'Rejected', 'Removed', 'Review', 'Active')) not null default 'Proposed';`)
        this.addSql(`delete from "app_user_organization_role_versions";`)
        this.addSql(`delete from "app_user_organization_role";`)
        this.addSql(`delete from "requirement_versions";`)
        this.addSql(`delete from "requirement";`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop column "workflow_state";`)
    }
}
