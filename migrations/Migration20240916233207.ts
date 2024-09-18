import { Migration } from '@mikro-orm/migrations';

export class Migration20240916233207 extends Migration {

  override async up(): Promise<void> {
    this.addSql('create table "parsed_requirements" ("id" uuid not null, "solution_id" uuid not null, "statement" varchar(1000) not null, "submitted_by_id" uuid not null, "submitted_at" timestamptz not null default now(), "json_result" jsonb null, constraint "parsed_requirements_pkey" primary key ("id"));');

    this.addSql('alter table "parsed_requirements" add constraint "parsed_requirements_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');
    this.addSql('alter table "parsed_requirements" add constraint "parsed_requirements_submitted_by_id_foreign" foreign key ("submitted_by_id") references "app_user" ("id") on update cascade;');
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "parsed_requirements" cascade;');
  }

}
