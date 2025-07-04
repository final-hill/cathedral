import { Migration } from '@mikro-orm/migrations';

export class Migration20250629184357 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "slack_workspace_meta" ("team_id" varchar(255) not null, "team_name" varchar(255) not null, "organization_id" uuid not null, "access_token" text not null, "bot_user_id" varchar(255) not null, "scope" text not null, "app_id" varchar(255) not null, "installed_by_id" uuid not null, "installation_date" timestamptz not null, "last_refresh_date" timestamptz null, "is_active" boolean not null default true, constraint "slack_workspace_meta_pkey" primary key ("team_id"));`);

    this.addSql(`alter table "slack_workspace_meta" add constraint "slack_workspace_meta_organization_id_foreign" foreign key ("organization_id") references "requirement" ("id") on update cascade;`);
    this.addSql(`alter table "slack_workspace_meta" add constraint "slack_workspace_meta_installed_by_id_foreign" foreign key ("installed_by_id") references "app_user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "slack_workspace_meta" cascade;`);
  }

}
