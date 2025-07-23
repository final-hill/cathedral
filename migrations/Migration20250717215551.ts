import { Migration } from '@mikro-orm/migrations'

export class Migration20250717215551 extends Migration {
    override async up(): Promise<void> {
        // Drop the app_credentials table as it's no longer needed after migrating to Entra External ID
        this.addSql(`drop table if exists "app_credentials" cascade;`)

        // Drop all foreign key constraints FIRST before changing column types
        this.addSql(`alter table "app_user" drop constraint if exists "app_user_created_by_id_foreign";`)
        this.addSql(`alter table "app_user" drop constraint if exists "app_user_modified_by_id_foreign";`)
        this.addSql(`alter table "app_user" drop constraint if exists "app_user_email_unique";`)
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_created_by_id_foreign";`)
        this.addSql(`alter table "app_user_organization_role" drop constraint if exists "app_user_organization_role_app_user_id_foreign";`)
        this.addSql(`alter table "app_user_organization_role" drop constraint if exists "app_user_organization_role_created_by_id_foreign";`)
        this.addSql(`alter table "app_user_organization_role" drop constraint if exists "app_user_organization_role_modified_by_id_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_modified_by_id_foreign";`)
        this.addSql(`alter table "slack_channel_meta" drop constraint if exists "slack_channel_meta_created_by_id_foreign";`)
        this.addSql(`alter table "slack_user_meta" drop constraint if exists "slack_user_meta_app_user_id_foreign";`)
        this.addSql(`alter table "slack_user_meta" drop constraint if exists "slack_user_meta_created_by_id_foreign";`)
        this.addSql(`alter table "slack_workspace_meta" drop constraint if exists "slack_workspace_meta_installed_by_id_foreign";`)

        // Clear all existing data for fresh start with Entra External ID authentication
        this.addSql(`truncate table "app_user_organization_role" cascade;`)
        this.addSql(`truncate table "slack_user_meta" cascade;`)
        this.addSql(`truncate table "slack_channel_meta" cascade;`)
        this.addSql(`truncate table "slack_workspace_meta" cascade;`)
        this.addSql(`truncate table "requirement_versions" cascade;`)
        this.addSql(`truncate table "requirement" cascade;`)
        this.addSql(`truncate table "app_user" cascade;`)

        // Convert all user ID columns from UUID to varchar(766) for Entra External ID compatibility
        this.addSql(`alter table "app_user" alter column "id" type varchar(766) using ("id"::varchar(766));`)
        this.addSql(`alter table "app_user" alter column "created_by_id" type varchar(766) using ("created_by_id"::varchar(766));`)
        this.addSql(`alter table "app_user" alter column "modified_by_id" type varchar(766) using ("modified_by_id"::varchar(766));`)
        this.addSql(`alter table "requirement" alter column "created_by_id" type varchar(766) using ("created_by_id"::varchar(766));`)
        this.addSql(`alter table "app_user_organization_role" alter column "app_user_id" type varchar(766) using ("app_user_id"::varchar(766));`)
        this.addSql(`alter table "app_user_organization_role" alter column "created_by_id" type varchar(766) using ("created_by_id"::varchar(766));`)
        this.addSql(`alter table "app_user_organization_role" alter column "modified_by_id" type varchar(766) using ("modified_by_id"::varchar(766));`)
        this.addSql(`alter table "requirement_versions" alter column "modified_by_id" type varchar(766) using ("modified_by_id"::varchar(766));`)
        this.addSql(`alter table "slack_channel_meta" alter column "created_by_id" type varchar(766) using ("created_by_id"::varchar(766));`)
        this.addSql(`alter table "slack_user_meta" alter column "app_user_id" type varchar(766) using ("app_user_id"::varchar(766));`)
        this.addSql(`alter table "slack_user_meta" alter column "created_by_id" type varchar(766) using ("created_by_id"::varchar(766));`)
        this.addSql(`alter table "slack_workspace_meta" alter column "installed_by_id" type varchar(766) using ("installed_by_id"::varchar(766));`)

        // Do NOT re-add foreign key constraints since the app_user table will be dropped in the next migration
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "app_user" drop constraint "app_user_created_by_id_foreign";`)
        this.addSql(`alter table "app_user" drop constraint "app_user_modified_by_id_foreign";`)

        this.addSql(`alter table "requirement" drop constraint "requirement_created_by_id_foreign";`)

        this.addSql(`alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";`)
        this.addSql(`alter table "app_user_organization_role" drop constraint "app_user_organization_role_created_by_id_foreign";`)
        this.addSql(`alter table "app_user_organization_role" drop constraint "app_user_organization_role_modified_by_id_foreign";`)

        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_modified_by_id_foreign";`)

        this.addSql(`alter table "slack_channel_meta" drop constraint "slack_channel_meta_created_by_id_foreign";`)

        this.addSql(`alter table "slack_user_meta" drop constraint "slack_user_meta_app_user_id_foreign";`)
        this.addSql(`alter table "slack_user_meta" drop constraint "slack_user_meta_created_by_id_foreign";`)

        this.addSql(`alter table "slack_workspace_meta" drop constraint "slack_workspace_meta_installed_by_id_foreign";`)

        this.addSql(`alter table "app_user" alter column "id" drop default;`)
        this.addSql(`alter table "app_user" alter column "id" type uuid using ("id"::text::uuid);`)
        this.addSql(`alter table "app_user" alter column "created_by_id" drop default;`)
        this.addSql(`alter table "app_user" alter column "created_by_id" type uuid using ("created_by_id"::text::uuid);`)
        this.addSql(`alter table "app_user" alter column "modified_by_id" drop default;`)
        this.addSql(`alter table "app_user" alter column "modified_by_id" type uuid using ("modified_by_id"::text::uuid);`)
        this.addSql(`alter table "app_user" add constraint "app_user_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user" add constraint "app_user_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user" add constraint "app_user_email_unique" unique ("email");`)

        this.addSql(`alter table "requirement" alter column "created_by_id" drop default;`)
        this.addSql(`alter table "requirement" alter column "created_by_id" type uuid using ("created_by_id"::text::uuid);`)
        this.addSql(`alter table "requirement" add constraint "requirement_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "app_user_organization_role" alter column "app_user_id" drop default;`)
        this.addSql(`alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);`)
        this.addSql(`alter table "app_user_organization_role" alter column "created_by_id" drop default;`)
        this.addSql(`alter table "app_user_organization_role" alter column "created_by_id" type uuid using ("created_by_id"::text::uuid);`)
        this.addSql(`alter table "app_user_organization_role" alter column "modified_by_id" drop default;`)
        this.addSql(`alter table "app_user_organization_role" alter column "modified_by_id" type uuid using ("modified_by_id"::text::uuid);`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_versions" alter column "modified_by_id" drop default;`)
        this.addSql(`alter table "requirement_versions" alter column "modified_by_id" type uuid using ("modified_by_id"::text::uuid);`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "slack_channel_meta" alter column "created_by_id" drop default;`)
        this.addSql(`alter table "slack_channel_meta" alter column "created_by_id" type uuid using ("created_by_id"::text::uuid);`)
        this.addSql(`alter table "slack_channel_meta" add constraint "slack_channel_meta_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "slack_user_meta" alter column "app_user_id" drop default;`)
        this.addSql(`alter table "slack_user_meta" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);`)
        this.addSql(`alter table "slack_user_meta" alter column "created_by_id" drop default;`)
        this.addSql(`alter table "slack_user_meta" alter column "created_by_id" type uuid using ("created_by_id"::text::uuid);`)
        this.addSql(`alter table "slack_user_meta" add constraint "slack_user_meta_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "slack_user_meta" add constraint "slack_user_meta_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "slack_workspace_meta" alter column "installed_by_id" drop default;`)
        this.addSql(`alter table "slack_workspace_meta" alter column "installed_by_id" type uuid using ("installed_by_id"::text::uuid);`)
        this.addSql(`alter table "slack_workspace_meta" add constraint "slack_workspace_meta_installed_by_id_foreign" foreign key ("installed_by_id") references "app_user" ("id") on update cascade;`)
    }
}
