import { Migration } from '@mikro-orm/migrations'

export class Migration20250204183425 extends Migration {
    override async up(): Promise<void> {
        // Deleting all data from the tables as we need the new versioning data
        this.addSql(`delete from "requirement_relation";`)
        this.addSql(`delete from "app_user_organization_role";`)
        this.addSql(`delete from "requirement";`)
        this.addSql(`delete from "app_user";`)

        this.addSql(`create table "app_user_versions" ("effective_from" timestamptz not null, "app_user_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, "name" varchar(254) not null, "email" varchar(254) not null, "last_login_date" timestamptz null, "is_system_admin" boolean not null, constraint "app_user_versions_pkey" primary key ("effective_from", "app_user_id"));`)

        this.addSql(`create table "app_user_organization_role_versions" ("effective_from" timestamptz not null, "app_user_organization_role_app_user_id" uuid not null, "app_user_organization_role_organization_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, "role" text check ("role" in ('Organization Admin', 'Organization Contributor', 'Organization Reader')) not null, constraint "app_user_organization_role_versions_pkey" primary key ("effective_from", "app_user_organization_role_app_user_id", "app_user_organization_role_organization_id"));`)

        this.addSql(`create table "requirement_relation_versions" ("effective_from" timestamptz not null, "rel_type" text check ("rel_type" in ('belongs', 'characterizes', 'constrains', 'contradicts', 'details', 'disjoins', 'duplicates', 'excepts', 'explains', 'extends', 'follows', 'relation', 'repeats', 'shares')) not null, "requirement_relation_left_id" uuid not null, "requirement_relation_right_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, constraint "requirement_relation_versions_pkey" primary key ("effective_from", "rel_type", "requirement_relation_left_id", "requirement_relation_right_id"));`)
        this.addSql(`create index "requirement_relation_versions_rel_type_index" on "requirement_relation_versions" ("rel_type");`)

        this.addSql(`create table "requirement_versions" ("effective_from" timestamptz not null, "requirement_id" uuid not null, "is_deleted" boolean not null, "modified_by_id" uuid not null, "req_type" text check ("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story')) not null, "name" varchar(100) not null, "description" varchar(1000) not null, "req_id" varchar(255) null, "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) null, "email" varchar(254) null, "primary_actor_id" uuid null, "outcome_id" uuid null, "slug" varchar(255) null, "segmentation" text check ("segmentation" in ('Client', 'Vendor')) null, "category" text check ("category" in ('Business Rule', 'Physical Law', 'Engineering Decision', 'Key Stakeholder', 'Shadow Influencer', 'Fellow Traveler', 'Observer')) null, "availability" int null, "influence" int null, "scope" varchar(255) null, "level" varchar(255) null, "precondition_id" uuid null, "trigger_id" uuid null, "main_success_scenario" varchar(255) null, "success_guarantee_id" uuid null, "extensions" varchar(255) null, "functional_behavior_id" uuid null, constraint "requirement_versions_pkey" primary key ("effective_from", "requirement_id"));`)
        this.addSql(`create index "requirement_versions_req_type_index" on "requirement_versions" ("req_type");`)

        this.addSql(`alter table "app_user_versions" add constraint "app_user_versions_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_versions" add constraint "app_user_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "app_user_organization_role" drop constraint "app_user_organization_role_pkey";`)
        this.addSql(`alter table "app_user_organization_role" drop column "role";`)

        this.addSql(`alter table "app_user_organization_role" add column "created_by_id" uuid not null, add column "creation_date" timestamptz not null;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_pkey" primary key ("app_user_id", "organization_id");`)

        this.addSql(`alter table "app_user_organization_role_versions" add constraint "app_user_organization_role_versions_app_user_org_2e4e9_foreign" foreign key ("app_user_organization_role_app_user_id", "app_user_organization_role_organization_id") references "app_user_organization_role" ("app_user_id", "organization_id") on update cascade;`)
        this.addSql(`alter table "app_user_organization_role_versions" add constraint "app_user_organization_role_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_relation_versions" add constraint "requirement_relation_versions_requirement_relati_2b2b8_foreign" foreign key ("requirement_relation_left_id", "requirement_relation_right_id") references "requirement_relation" ("left_id", "right_id") on update cascade;`)
        this.addSql(`alter table "requirement_relation_versions" add constraint "requirement_relation_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_requirement_id_foreign" foreign key ("requirement_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_primary_actor_id_foreign" foreign key ("primary_actor_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_outcome_id_foreign" foreign key ("outcome_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_precondition_id_foreign" foreign key ("precondition_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "requirement" ("id") on update cascade on delete set null;`)

        // Dropping the audit_log table as Version Normal Form subsumes it
        this.addSql(`drop table if exists "audit_log" cascade;`)

        this.addSql(`alter table "requirement" drop constraint "requirement_modified_by_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_primary_actor_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_outcome_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_precondition_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_success_guarantee_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_functional_behavior_id_foreign";`)

        this.addSql(`alter table "requirement_relation" drop constraint if exists "requirement_relation_rel_type_check";`)

        this.addSql(`alter table "app_user" drop column "name", drop column "email", drop column "last_login_date", drop column "is_system_admin";`)

        this.addSql(`alter table "app_user" add column "created_by_id" uuid not null;`)
        this.addSql(`alter table "app_user" add constraint "app_user_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "requirement" drop constraint "requirement_slug_unique";`)
        this.addSql(`alter table "requirement" drop column "req_id", drop column "name", drop column "description", drop column "last_modified", drop column "modified_by_id", drop column "is_silence", drop column "priority", drop column "email", drop column "primary_actor_id", drop column "outcome_id", drop column "slug", drop column "segmentation", drop column "category", drop column "availability", drop column "influence", drop column "scope", drop column "level", drop column "precondition_id", drop column "trigger_id", drop column "main_success_scenario", drop column "success_guarantee_id", drop column "extensions", drop column "functional_behavior_id";`)

        this.addSql(`alter table "requirement" add column "creation_date" timestamptz not null;`)

        this.addSql(`alter table "requirement_relation" add column "created_by_id" uuid not null, add column "creation_date" timestamptz not null;`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_rel_type_check" check("rel_type" in ('belongs', 'characterizes', 'constrains', 'contradicts', 'details', 'disjoins', 'duplicates', 'excepts', 'explains', 'extends', 'follows', 'relation', 'repeats', 'shares'));`)
    }

    override async down(): Promise<void> {
        // There is no going back from this migration
        // We want all records to have accurate versioning data
    }
}
