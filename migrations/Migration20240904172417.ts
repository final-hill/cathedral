import { Migration } from '@mikro-orm/migrations';

export class Migration20240904172417 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";');
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_organization_id_foreign";');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop default;');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" set not null;');
    this.addSql('alter table "app_user_organization_role" alter column "organization_id" drop default;');
    this.addSql('alter table "app_user_organization_role" alter column "organization_id" type uuid using ("organization_id"::text::uuid);');
    this.addSql('alter table "app_user_organization_role" alter column "organization_id" set not null;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";');
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_organization_id_foreign";');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop default;');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop not null;');
    this.addSql('alter table "app_user_organization_role" alter column "organization_id" drop default;');
    this.addSql('alter table "app_user_organization_role" alter column "organization_id" type uuid using ("organization_id"::text::uuid);');
    this.addSql('alter table "app_user_organization_role" alter column "organization_id" drop not null;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on delete cascade;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on delete cascade;');
  }

}
