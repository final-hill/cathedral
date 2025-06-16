import { Migration } from '@mikro-orm/migrations';

export class Migration20250612142951 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "slack_channel_meta" ("channel_id" varchar(255) not null, "team_id" varchar(255) not null, "solution_id" uuid not null, "created_by_id" uuid not null, "creation_date" timestamptz not null, constraint "slack_channel_meta_pkey" primary key ("channel_id", "team_id"));`);

    this.addSql(`create table "slack_user_meta" ("slack_user_id" varchar(255) not null, "team_id" varchar(255) not null, "app_user_id" uuid not null, "created_by_id" uuid not null, "creation_date" timestamptz not null, constraint "slack_user_meta_pkey" primary key ("slack_user_id", "team_id"));`);

    this.addSql(`alter table "slack_channel_meta" add constraint "slack_channel_meta_solution_id_foreign" foreign key ("solution_id") references "requirement" ("id") on update cascade;`);
    this.addSql(`alter table "slack_channel_meta" add constraint "slack_channel_meta_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "slack_user_meta" add constraint "slack_user_meta_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`);
    this.addSql(`alter table "slack_user_meta" add constraint "slack_user_meta_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "slack_channel_meta" cascade;`);

    this.addSql(`drop table if exists "slack_user_meta" cascade;`);
  }

}
