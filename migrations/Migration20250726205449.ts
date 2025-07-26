import { Migration } from '@mikro-orm/migrations'

export class Migration20250726205449 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_workflow_state_check";`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_workflow_state_check" check("workflow_state" in ('Proposed', 'Rejected', 'Removed', 'Review', 'Active', 'Parsed'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_workflow_state_check";`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_workflow_state_check" check("workflow_state" in ('Proposed', 'Rejected', 'Removed', 'Review', 'Active'));`)
    }
}
