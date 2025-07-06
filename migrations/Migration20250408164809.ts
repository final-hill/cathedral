import { Migration } from '@mikro-orm/migrations'

export class Migration20250408164809 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`delete from "app_user_organization_role_versions";`)
        this.addSql(`delete from "app_user_organization_role";`)
        this.addSql(`delete from "requirement_relation_versions";`)
        this.addSql(`delete from "requirement_relation";`)
        this.addSql(`delete from "requirement_versions";`)
        this.addSql(`delete from "requirement";`)
        this.addSql(`delete from "app_user_versions";`)
        this.addSql(`delete from "app_user";`)

        this.addSql(`alter table "requirement_relation_versions" drop constraint "requirement_relation_versions_requirement_relati_2b2b8_foreign";`)

        this.addSql(`drop table if exists "requirement_relation" cascade;`)

        this.addSql(`drop table if exists "requirement_relation_versions" cascade;`)

        this.addSql(`alter table "requirement_versions" add column "solution_id" uuid null, add column "parent_component_effective_from" timestamptz null, add column "parent_component_requirement_id" uuid null, add column "organization_id" uuid null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_solution_id_foreign" foreign key ("solution_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_organization_id_foreign" foreign key ("organization_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_parent_component_effective__e6046_foreign" foreign key ("parent_component_effective_from", "parent_component_requirement_id") references "requirement_versions" ("effective_from", "requirement_id") on update cascade on delete set null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`create table "requirement_relation" ("left_id" uuid not null, "right_id" uuid not null, "created_by_id" uuid not null, "creation_date" timestamptz not null, "rel_type" text check ("rel_type" in ('belongs', 'characterizes', 'constrains', 'contradicts', 'details', 'disjoins', 'duplicates', 'excepts', 'explains', 'extends', 'follows', 'relation', 'repeats', 'shares')) not null, constraint "requirement_relation_pkey" primary key ("left_id", "right_id"));`)
        this.addSql(`create index "requirement_relation_rel_type_index" on "requirement_relation" ("rel_type");`)

        this.addSql(`create table "requirement_relation_versions" ("effective_from" timestamptz not null, "rel_type" text check ("rel_type" in ('belongs', 'characterizes', 'constrains', 'contradicts', 'details', 'disjoins', 'duplicates', 'excepts', 'explains', 'extends', 'follows', 'relation', 'repeats', 'shares')) not null, "requirement_relation_left_id" uuid not null, "requirement_relation_right_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, constraint "requirement_relation_versions_pkey" primary key ("effective_from", "rel_type", "requirement_relation_left_id", "requirement_relation_right_id"));`)
        this.addSql(`create index "requirement_relation_versions_rel_type_index" on "requirement_relation_versions" ("rel_type");`)

        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_foreign" foreign key ("left_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_foreign" foreign key ("right_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_relation_versions" add constraint "requirement_relation_versions_requirement_relati_2b2b8_foreign" foreign key ("requirement_relation_left_id", "requirement_relation_right_id") references "requirement_relation" ("left_id", "right_id") on update cascade;`)
        this.addSql(`alter table "requirement_relation_versions" add constraint "requirement_relation_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_solution_id_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_parent_component_effective__e6046_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_organization_id_foreign";`)

        this.addSql(`alter table "requirement_versions" drop column "solution_id", drop column "parent_component_effective_from", drop column "parent_component_requirement_id", drop column "organization_id";`)
    }
}
