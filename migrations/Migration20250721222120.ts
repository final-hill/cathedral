import { Migration } from '@mikro-orm/migrations'

export class Migration20250721222120 extends Migration {
    override async up(): Promise<void> {
    // All foreign key constraints have already been dropped in the previous migration
    // Just drop the tables with cascade to handle any remaining constraints
        this.addSql(`drop table if exists "app_user" cascade;`)

        this.addSql(`drop table if exists "app_user_organization_role" cascade;`)
    }

    override async down(): Promise<void> {
        this.addSql(`create table "app_user" ("id" varchar(766) not null, "created_by_id" varchar(766) not null, "creation_date" timestamptz not null, "modified_by_id" varchar(766) not null, "name" varchar(254) not null, "email" varchar(254) not null, "last_login_date" timestamptz null, "last_modified" timestamptz null, "is_system_admin" boolean not null, constraint "app_user_pkey" primary key ("id"));`)

        this.addSql(`create table "app_user_organization_role" ("app_user_id" varchar(766) not null, "organization_id" uuid not null, "role" text check ("role" in ('Organization Admin', 'Organization Contributor', 'Organization Reader')) not null, "created_by_id" varchar(766) not null, "creation_date" timestamptz not null, "modified_by_id" varchar(766) not null, "last_modified" timestamptz null, constraint "app_user_organization_role_pkey" primary key ("app_user_id", "organization_id"));`)

        this.addSql(`alter table "app_user" add constraint "app_user_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user" add constraint "app_user_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement" add constraint "requirement_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "slack_channel_meta" add constraint "slack_channel_meta_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "slack_user_meta" add constraint "slack_user_meta_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "slack_user_meta" add constraint "slack_user_meta_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "slack_workspace_meta" add constraint "slack_workspace_meta_installed_by_id_foreign" foreign key ("installed_by_id") references "app_user" ("id") on update cascade;`)
    }
}
