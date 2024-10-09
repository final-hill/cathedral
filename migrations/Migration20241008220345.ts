import { Migration } from '@mikro-orm/migrations';

export class Migration20241008220345 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "audit_log" ("id" uuid not null, "type" text check ("type" in ('create', 'update', 'delete', 'update_early', 'delete_early')) not null, "entity" jsonb null, "created_at" timestamptz not null, constraint "audit_log_pkey" primary key ("id"));`);

    this.addSql(`create table "role" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "role_pkey" primary key ("id"));`);

    this.addSql(`create table "responsibility" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "responsibility_pkey" primary key ("id"));`);

    this.addSql(`create table "task" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "task_pkey" primary key ("id"));`);

    this.addSql(`create table "test_case" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) not null, constraint "test_case_pkey" primary key ("id"));`);

    this.addSql(`alter table "role" add constraint "role_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
    this.addSql(`alter table "role" add constraint "role_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "responsibility" add constraint "responsibility_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
    this.addSql(`alter table "responsibility" add constraint "responsibility_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "task" add constraint "task_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
    this.addSql(`alter table "task" add constraint "task_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "test_case" add constraint "test_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
    this.addSql(`alter table "test_case" add constraint "test_case_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "audit_log" cascade;`);

    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`drop table if exists "responsibility" cascade;`);

    this.addSql(`drop table if exists "task" cascade;`);

    this.addSql(`drop table if exists "test_case" cascade;`);
  }

}
