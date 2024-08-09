import { Migration } from '@mikro-orm/migrations';

export class Migration20240808202308 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_role_name_foreign";');

    this.addSql('drop table if exists "app_role" cascade;');

    this.addSql('alter table "app_user" add column "last_login_date" timestamptz null, add column "email" char(254) not null;');

    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_pkey";');
    this.addSql('alter table "app_user_organization_role" drop column "role_name";');

    this.addSql('alter table "app_user_organization_role" add column "role" text check ("role" in (\'Organization Admin\', \'Organization Contributor\', \'Organization Reader\')) not null default \'Organization Reader\';');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_pkey" primary key ("app_user_id", "organization_id", "role");');
  }

  override async down(): Promise<void> {
    this.addSql('create table "app_role" ("name" varchar(100) not null, constraint "app_role_pkey" primary key ("name"));');

    this.addSql('alter table "app_user" drop column "last_login_date", drop column "email";');

    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_pkey";');
    this.addSql('alter table "app_user_organization_role" drop column "role";');

    this.addSql('alter table "app_user_organization_role" add column "role_name" varchar(100) null;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_role_name_foreign" foreign key ("role_name") references "app_role" ("name") on delete cascade;');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_pkey" primary key ("app_user_id", "organization_id", "role_name");');
  }

}
