import { Migration } from '@mikro-orm/migrations'

export class Migration20241001191843 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "silence" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "is_silence" boolean not null default false, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', constraint "silence_pkey" primary key ("id"));`)

        this.addSql(`create table "parsed_requirement" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "is_silence" boolean not null default false, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', constraint "parsed_requirement_pkey" primary key ("id"));`)

        this.addSql(`create table "noise" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "is_silence" boolean not null default false, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', constraint "noise_pkey" primary key ("id"));`)

        this.addSql(`alter table "silence" add constraint "silence_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`)
        this.addSql(`alter table "silence" add constraint "silence_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "parsed_requirement" add constraint "parsed_requirement_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`)
        this.addSql(`alter table "parsed_requirement" add constraint "parsed_requirement_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`alter table "noise" add constraint "noise_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`)
        this.addSql(`alter table "noise" add constraint "noise_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`drop table if exists "parsed_requirements" cascade;`)

        this.addSql(`alter table "product" add column "is_silence" boolean not null default false;`)

        this.addSql(`alter table "person" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "person" add constraint "person_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "outcome" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "outcome" add constraint "outcome_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "obstacle" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "obstacle" add constraint "obstacle_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "non_functional_behavior" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "non_functional_behavior" add constraint "non_functional_behavior_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "limit" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "limit" add constraint "limit_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "justification" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "justification" add constraint "justification_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "invariant" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "invariant" add constraint "invariant_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "hint" add column "is_silence" boolean not null default false;`)

        this.addSql(`alter table "glossary_term" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "glossary_term" add constraint "glossary_term_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "functional_behavior" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "functional_behavior" add constraint "functional_behavior_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "environment_component" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "environment_component" add constraint "environment_component_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "effect" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "effect" add constraint "effect_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "constraint" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "constraint" add constraint "constraint_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "assumption" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "assumption" add constraint "assumption_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "stakeholder" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "stakeholder" add constraint "stakeholder_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "system_component" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "system_component" add constraint "system_component_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "use_case" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "use_case" add constraint "use_case_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "user_story" add column "is_silence" boolean not null default false, add column "follows_id" uuid null;`)
        this.addSql(`alter table "user_story" add constraint "user_story_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "person" drop constraint "person_follows_id_foreign";`)

        this.addSql(`alter table "outcome" drop constraint "outcome_follows_id_foreign";`)

        this.addSql(`alter table "obstacle" drop constraint "obstacle_follows_id_foreign";`)

        this.addSql(`alter table "non_functional_behavior" drop constraint "non_functional_behavior_follows_id_foreign";`)

        this.addSql(`alter table "limit" drop constraint "limit_follows_id_foreign";`)

        this.addSql(`alter table "justification" drop constraint "justification_follows_id_foreign";`)

        this.addSql(`alter table "invariant" drop constraint "invariant_follows_id_foreign";`)

        this.addSql(`alter table "glossary_term" drop constraint "glossary_term_follows_id_foreign";`)

        this.addSql(`alter table "functional_behavior" drop constraint "functional_behavior_follows_id_foreign";`)

        this.addSql(`alter table "environment_component" drop constraint "environment_component_follows_id_foreign";`)

        this.addSql(`alter table "effect" drop constraint "effect_follows_id_foreign";`)

        this.addSql(`alter table "constraint" drop constraint "constraint_follows_id_foreign";`)

        this.addSql(`alter table "assumption" drop constraint "assumption_follows_id_foreign";`)

        this.addSql(`alter table "stakeholder" drop constraint "stakeholder_follows_id_foreign";`)

        this.addSql(`alter table "system_component" drop constraint "system_component_follows_id_foreign";`)

        this.addSql(`alter table "use_case" drop constraint "use_case_follows_id_foreign";`)

        this.addSql(`alter table "user_story" drop constraint "user_story_follows_id_foreign";`)

        this.addSql(`create table "parsed_requirements" ("id" uuid not null, "solution_id" uuid not null, "statement" varchar(1000) not null, "submitted_by_id" uuid not null, "submitted_at" timestamptz not null default now(), "json_result" jsonb null, constraint "parsed_requirements_pkey" primary key ("id"));`)

        this.addSql(`alter table "parsed_requirements" add constraint "parsed_requirements_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`)
        this.addSql(`alter table "parsed_requirements" add constraint "parsed_requirements_submitted_by_id_foreign" foreign key ("submitted_by_id") references "app_user" ("id") on update cascade;`)

        this.addSql(`drop table if exists "silence" cascade;`)

        this.addSql(`drop table if exists "parsed_requirement" cascade;`)

        this.addSql(`drop table if exists "noise" cascade;`)

        this.addSql(`alter table "product" drop column "is_silence";`)

        this.addSql(`alter table "person" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "outcome" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "obstacle" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "non_functional_behavior" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "limit" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "justification" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "invariant" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "hint" drop column "is_silence";`)

        this.addSql(`alter table "glossary_term" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "functional_behavior" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "environment_component" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "effect" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "constraint" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "assumption" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "stakeholder" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "system_component" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "use_case" drop column "is_silence", drop column "follows_id";`)

        this.addSql(`alter table "user_story" drop column "is_silence", drop column "follows_id";`)
    }
}
