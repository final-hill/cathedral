import { Migration } from '@mikro-orm/migrations';

export class Migration20250501215418 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`create table "app_credentials" ("id" uuid not null, "app_user_id" uuid not null, "public_key" varchar(255) not null, "counter" int not null, "backed_up" boolean not null, "transports" jsonb null, constraint "app_credentials_pkey" primary key ("id", "app_user_id"));`);

        this.addSql(`alter table "app_credentials" add constraint "app_credentials_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`drop table if exists "app_user_versions" cascade;`);

        this.addSql(`drop table if exists "app_user_organization_role_versions" cascade;`);

        this.addSql(`delete from "app_user_organization_role";`);
        this.addSql(`delete from "requirement_versions";`);
        this.addSql(`delete from "requirement";`);
        this.addSql(`delete from "app_user";`);

        this.addSql(`alter table "app_user" add column "modified_by_id" uuid not null, add column "name" varchar(254) not null, add column "email" varchar(254) not null, add column "last_login_date" timestamptz null, add column "last_modified" timestamptz null, add column "is_system_admin" boolean not null;`);
        this.addSql(`alter table "app_user" add constraint "app_user_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "app_user" add constraint "app_user_email_unique" unique ("email");`);

        this.addSql(`alter table "app_user_organization_role" add column "role" text check ("role" in ('Organization Admin', 'Organization Contributor', 'Organization Reader')) not null, add column "modified_by_id" uuid not null, add column "last_modified" timestamptz null;`);
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
    }

    override async down(): Promise<void> {
        this.addSql(`create table "app_user_versions" ("effective_from" timestamptz not null, "app_user_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, "name" varchar(254) not null, "email" varchar(254) not null, "last_login_date" timestamptz null, "is_system_admin" boolean not null, constraint "app_user_versions_pkey" primary key ("effective_from", "app_user_id"));`);

        this.addSql(`create table "app_user_organization_role_versions" ("effective_from" timestamptz not null, "app_user_organization_role_app_user_id" uuid not null, "app_user_organization_role_organization_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, "role" text check ("role" in ('Organization Admin', 'Organization Contributor', 'Organization Reader')) not null, constraint "app_user_organization_role_versions_pkey" primary key ("effective_from", "app_user_organization_role_app_user_id", "app_user_organization_role_organization_id"));`);

        this.addSql(`alter table "app_user_versions" add constraint "app_user_versions_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "app_user_versions" add constraint "app_user_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "app_user_organization_role_versions" add constraint "app_user_organization_role_versions_app_user_org_2e4e9_foreign" foreign key ("app_user_organization_role_app_user_id", "app_user_organization_role_organization_id") references "app_user_organization_role" ("app_user_id", "organization_id") on update cascade;`);
        this.addSql(`alter table "app_user_organization_role_versions" add constraint "app_user_organization_role_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`drop table if exists "app_credentials" cascade;`);

        this.addSql(`alter table "app_user" drop constraint "app_user_modified_by_id_foreign";`);

        this.addSql(`alter table "app_user_organization_role" drop constraint "app_user_organization_role_modified_by_id_foreign";`);

        this.addSql(`alter table "app_user" drop constraint "app_user_email_unique";`);
        this.addSql(`alter table "app_user" drop column "modified_by_id", drop column "name", drop column "email", drop column "last_login_date", drop column "last_modified", drop column "is_system_admin";`);

        this.addSql(`alter table "app_user_organization_role" drop column "role", drop column "modified_by_id", drop column "last_modified";`);
    }

}
