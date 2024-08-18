import { Migration } from '@mikro-orm/migrations';

export class Migration20240818015511 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";');

    this.addSql('alter table "app_user" alter column "id" drop default;');
    this.addSql('alter table "app_user" alter column "id" type uuid using ("id"::text::uuid);');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop default;');
    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on delete cascade;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "app_user" alter column "id" type text using ("id"::text);');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type text using ("app_user_id"::text);');

    this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";');

    this.addSql('alter table "app_user" alter column "id" type char(254) using ("id"::char(254));');

    this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type char(254) using ("app_user_id"::char(254));');
    this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on delete cascade;');
  }

}
