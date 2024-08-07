import { Migration } from '@mikro-orm/migrations';

export class Migration20240807011214 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";');

    this.addSql('create table "app_user_system_admin_role" ("app_user_id" uuid not null, constraint "app_user_system_admin_role_pkey" primary key ("app_user_id"));');

    this.addSql('drop table if exists "app_user" cascade;');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop default;');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" set not null;');
  }

  override async down(): Promise<void> {
    this.addSql('create table "app_user" ("id" char(254) not null, "name" char(254) not null, "creation_date" timestamptz not null, "is_system_admin" boolean not null, constraint "app_user_pkey" primary key ("id"));');

    this.addSql('drop table if exists "app_user_system_admin_role" cascade;');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type text using ("app_user_id"::text);');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type char(254) using ("app_user_id"::char(254));');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop not null;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on delete cascade;');
  }

}
