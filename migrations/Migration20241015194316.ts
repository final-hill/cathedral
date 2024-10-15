import { Migration } from '@mikro-orm/migrations';

export class Migration20241015194316 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`alter table "person" drop constraint "person_follows_id_foreign";`);

        this.addSql(`alter table "outcome" drop constraint "outcome_follows_id_foreign";`);

        this.addSql(`alter table "obstacle" drop constraint "obstacle_follows_id_foreign";`);

        this.addSql(`alter table "non_functional_behavior" drop constraint "non_functional_behavior_follows_id_foreign";`);

        this.addSql(`alter table "limit" drop constraint "limit_follows_id_foreign";`);

        this.addSql(`alter table "justification" drop constraint "justification_follows_id_foreign";`);

        this.addSql(`alter table "invariant" drop constraint "invariant_follows_id_foreign";`);

        this.addSql(`alter table "glossary_term" drop constraint "glossary_term_follows_id_foreign";`);

        this.addSql(`alter table "functional_behavior" drop constraint "functional_behavior_follows_id_foreign";`);

        this.addSql(`alter table "environment_component" drop constraint "environment_component_follows_id_foreign";`);

        this.addSql(`alter table "effect" drop constraint "effect_follows_id_foreign";`);

        this.addSql(`alter table "constraint" drop constraint "constraint_follows_id_foreign";`);

        this.addSql(`alter table "assumption" drop constraint "assumption_follows_id_foreign";`);

        this.addSql(`alter table "stakeholder" drop constraint "stakeholder_follows_id_foreign";`);

        this.addSql(`alter table "system_component" drop constraint "system_component_follows_id_foreign";`);

        this.addSql(`alter table "use_case" drop constraint "use_case_follows_id_foreign";`);

        this.addSql(`alter table "user_story" drop constraint "user_story_follows_id_foreign";`);

        this.addSql(`alter table "user_story" drop constraint "user_story_outcome_id_foreign";`);

        this.addSql(`alter table "glossary_term" drop constraint "glossary_term_parent_component_id_foreign";`);

        this.addSql(`alter table "user_story" drop constraint "user_story_functional_behavior_id_foreign";`);

        this.addSql(`alter table "environment_component" drop constraint "environment_component_parent_component_id_foreign";`);

        this.addSql(`alter table "use_case" drop constraint "use_case_success_guarantee_id_foreign";`);

        this.addSql(`alter table "use_case" drop constraint "use_case_precondition_id_foreign";`);

        this.addSql(`alter table "stakeholder" drop constraint "stakeholder_parent_component_id_foreign";`);

        this.addSql(`alter table "use_case" drop constraint "use_case_primary_actor_id_foreign";`);

        this.addSql(`alter table "user_story" drop constraint "user_story_primary_actor_id_foreign";`);

        this.addSql(`alter table "system_component" drop constraint "system_component_parent_component_id_foreign";`);

        this.addSql(`create table "requirement" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "req_type" text check ("req_type" in ('assumption', 'constraint', 'effect', 'environment_component', 'functional_behavior', 'glossary_term', 'hint', 'invariant', 'justification', 'limit', 'noise', 'non_functional_behavior', 'obstacle', 'outcome', 'parsed_requirement', 'person', 'product', 'responsibility', 'role', 'silence', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story')) not null, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) null, "parent_component_id" uuid null, "email" varchar(254) null, "primary_actor_id" uuid null, "segmentation" text check ("segmentation" in ('Client', 'Vendor')) null, "category" text check ("category" in ('Business Rule', 'Physical Law', 'Engineering Decision', 'Key Stakeholder', 'Shadow Influencer', 'Fellow Traveler', 'Observer')) null, "availability" int null, "influence" int null, "parent_component_1_id" uuid null, "scope" varchar(255) null, "level" varchar(255) null, "goal_in_context" varchar(255) null, "precondition_id" uuid null, "trigger_id" uuid null, "main_success_scenario" varchar(255) null, "success_guarantee_id" uuid null, "extensions" varchar(255) null, "follows_id" uuid null, "functional_behavior_id" uuid null, "outcome_id" uuid null, constraint "requirement_pkey" primary key ("id"));`);
        this.addSql(`create index "requirement_req_type_index" on "requirement" ("req_type");`);

        this.addSql(`alter table "requirement" add constraint "requirement_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "requirement" add constraint "requirement_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "requirement" add constraint "requirement_parent_component_id_foreign" foreign key ("parent_component_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_primary_actor_id_foreign" foreign key ("primary_actor_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_parent_component_1_id_foreign" foreign key ("parent_component_1_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_precondition_id_foreign" foreign key ("precondition_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_follows_id_foreign" foreign key ("follows_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_outcome_id_foreign" foreign key ("outcome_id") references "requirement" ("id") on update cascade on delete set null;`);

        /*
           For each entity, move the data to the requirement table and drop the entity table
        */

        // A helper function to perform the data migration
        this.addSql(`
            CREATE OR REPLACE FUNCTION migrate_table(old_table TEXT, req_type TEXT)
            RETURNS VOID AS $$
            DECLARE
                cols TEXT;
            BEGIN
                -- Find matching columns between the old table and the 'requirement' table
                SELECT string_agg(c.column_name, ', ') INTO cols
                FROM information_schema.columns c
                WHERE c.table_name = old_table
                AND c.column_name IN (
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'requirement'
                );

                -- Execute the dynamic insert statement
                EXECUTE format(
                    'INSERT INTO "requirement" (req_type, %s)
                    SELECT ''%s'', %s FROM %I',
                    cols, req_type, cols, old_table
                );
            END;
            $$ LANGUAGE plpgsql;
        `)

        this.addSql(`select migrate_table('silence', 'silence');`);
        this.addSql(`drop table if exists "silence" cascade;`);

        this.addSql(`select migrate_table('role', 'role');`);
        this.addSql(`drop table if exists "role" cascade;`);

        this.addSql(`select migrate_table('responsibility', 'responsibility');`);
        this.addSql(`drop table if exists "responsibility" cascade;`);

        this.addSql(`select migrate_table('product', 'product');`);
        this.addSql(`drop table if exists "product" cascade;`);

        this.addSql(`select migrate_table('parsed_requirement', 'parsed_requirement');`);
        this.addSql(`drop table if exists "parsed_requirement" cascade;`);

        this.addSql(`select migrate_table('person', 'person');`);
        this.addSql(`drop table if exists "person" cascade;`);

        this.addSql(`select migrate_table('outcome', 'outcome');`);
        this.addSql(`drop table if exists "outcome" cascade;`);

        this.addSql(`select migrate_table('obstacle', 'obstacle');`);
        this.addSql(`drop table if exists "obstacle" cascade;`);

        this.addSql(`select migrate_table('non_functional_behavior', 'non_functional_behavior');`);
        this.addSql(`drop table if exists "non_functional_behavior" cascade;`);

        this.addSql(`select migrate_table('noise', 'noise');`);
        this.addSql(`drop table if exists "noise" cascade;`);

        this.addSql(`select migrate_table('limit', 'limit');`);
        this.addSql(`drop table if exists "limit" cascade;`);

        this.addSql(`select migrate_table('justification', 'justification');`);
        this.addSql(`drop table if exists "justification" cascade;`);

        this.addSql(`select migrate_table('invariant', 'invariant');`);
        this.addSql(`drop table if exists "invariant" cascade;`);

        this.addSql(`select migrate_table('hint', 'hint');`);
        this.addSql(`drop table if exists "hint" cascade;`);

        this.addSql(`select migrate_table('glossary_term', 'glossary_term');`);
        this.addSql(`drop table if exists "glossary_term" cascade;`);

        this.addSql(`select migrate_table('functional_behavior', 'functional_behavior');`);
        this.addSql(`drop table if exists "functional_behavior" cascade;`);

        this.addSql(`select migrate_table('environment_component', 'environment_component');`);
        this.addSql(`drop table if exists "environment_component" cascade;`);

        this.addSql(`select migrate_table('effect', 'effect');`);
        this.addSql(`drop table if exists "effect" cascade;`);

        this.addSql(`select migrate_table('constraint', 'constraint');`);
        this.addSql(`drop table if exists "constraint" cascade;`);

        this.addSql(`select migrate_table('assumption', 'assumption');`);
        this.addSql(`drop table if exists "assumption" cascade;`);

        this.addSql(`select migrate_table('stakeholder', 'stakeholder');`);
        this.addSql(`drop table if exists "stakeholder" cascade;`);

        this.addSql(`select migrate_table('system_component', 'system_component');`);
        this.addSql(`drop table if exists "system_component" cascade;`);

        this.addSql(`select migrate_table('task', 'task');`);
        this.addSql(`drop table if exists "task" cascade;`);

        this.addSql(`select migrate_table('test_case', 'test_case');`);
        this.addSql(`drop table if exists "test_case" cascade;`);

        this.addSql(`select migrate_table('use_case', 'use_case');`);
        this.addSql(`drop table if exists "use_case" cascade;`);

        this.addSql(`select migrate_table('user_story', 'user_story');`);
        this.addSql(`drop table if exists "user_story" cascade;`);

        // cleanup function
        this.addSql(`drop function migrate_table;`);

        this.addSql(`alter table "audit_log" alter column "entity" type jsonb using ("entity"::jsonb);`);
        this.addSql(`alter table "audit_log" alter column "entity" set not null;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint "requirement_parent_component_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_primary_actor_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_parent_component_1_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_precondition_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_success_guarantee_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_follows_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_functional_behavior_id_foreign";`);

        this.addSql(`alter table "requirement" drop constraint "requirement_outcome_id_foreign";`);

        this.addSql(`
            CREATE OR REPLACE FUNCTION migrate_to_old_table(old_table TEXT, req_type TEXT)
            RETURNS VOID AS $$
            DECLARE
                cols TEXT;
            BEGIN
                -- Find matching columns between 'requirement' and the old table
                SELECT string_agg(c.column_name, ', ') INTO cols
                FROM information_schema.columns c
                WHERE c.table_name = old_table
                AND c.column_name IN (
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'requirement'
                );

                -- Execute the dynamic insert statement
                EXECUTE format(
                    'INSERT INTO %I (%s)
                    SELECT %s FROM "requirement" WHERE req_type = ''%s''',
                    old_table, cols, cols, req_type
                );
            END;
            $$ LANGUAGE plpgsql;
            `)

        this.addSql(`create table "silence" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "silence_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('silence', 'silence');`);

        this.addSql(`create table "role" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "role_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('role', 'role');`);

        this.addSql(`create table "responsibility" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "responsibility_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('responsibility', 'responsibility');`);

        this.addSql(`create table "product" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "product_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('product', 'product');`);

        this.addSql(`create table "parsed_requirement" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "parsed_requirement_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('parsed_requirement', 'parsed_requirement');`);

        this.addSql(`create table "person" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "email" varchar(254) null, "follows_id" uuid null, constraint "person_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('person', 'person');`);

        this.addSql(`create table "outcome" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "outcome_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('outcome', 'outcome');`);

        this.addSql(`create table "obstacle" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "obstacle_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('obstacle', 'obstacle');`);

        this.addSql(`create table "non_functional_behavior" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) not null, "follows_id" uuid null, constraint "non_functional_behavior_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('non_functional_behavior', 'non_functional_behavior');`);

        this.addSql(`create table "noise" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "noise_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('noise', 'noise');`);

        this.addSql(`create table "limit" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "limit_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('limit', 'limit');`);

        this.addSql(`create table "justification" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "justification_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('justification', 'justification');`);

        this.addSql(`create table "invariant" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "invariant_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('invariant', 'invariant');`);

        this.addSql(`create table "hint" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "hint_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('hint', 'hint');`);

        this.addSql(`create table "glossary_term" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "parent_component_id" uuid null, "follows_id" uuid null, constraint "glossary_term_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('glossary_term', 'glossary_term');`);

        this.addSql(`create table "functional_behavior" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) not null, "follows_id" uuid null, constraint "functional_behavior_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('functional_behavior', 'functional_behavior');`);

        this.addSql(`create table "environment_component" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "parent_component_id" uuid null, "follows_id" uuid null, constraint "environment_component_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('environment_component', 'environment_component');`);

        this.addSql(`create table "effect" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "effect_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('effect', 'effect');`);

        this.addSql(`create table "constraint" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "category" text check ("category" in ('Business Rule', 'Physical Law', 'Engineering Decision')) null, "follows_id" uuid null, constraint "constraint_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('constraint', 'constraint');`);

        this.addSql(`create table "assumption" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, constraint "assumption_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('assumption', 'assumption');`);

        this.addSql(`create table "stakeholder" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, "parent_component_id" uuid null, "segmentation" text check ("segmentation" in ('Client', 'Vendor')) null, "category" text check ("category" in ('Key Stakeholder', 'Shadow Influencer', 'Fellow Traveler', 'Observer')) null, "availability" int not null, "influence" int not null, constraint "stakeholder_pkey" primary key ("id"), constraint stakeholder_availability_check check (availability >= 0 AND availability <= 100), constraint stakeholder_influence_check check (influence >= 0 AND influence <= 100));`);
        this.addSql(`select migrate_to_old_table('stakeholder', 'stakeholder');`);

        this.addSql(`create table "system_component" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "follows_id" uuid null, "parent_component_id" uuid null, constraint "system_component_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('system_component', 'system_component');`);

        this.addSql(`create table "task" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, constraint "task_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('task', 'task');`);

        this.addSql(`create table "test_case" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) not null, constraint "test_case_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('test_case', 'test_case');`);

        this.addSql(`create table "use_case" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) not null, "primary_actor_id" uuid null, "follows_id" uuid null, "scope" varchar(255) not null, "level" varchar(255) not null, "goal_in_context" varchar(255) not null, "precondition_id" uuid null, "trigger_id" uuid null, "main_success_scenario" varchar(255) not null, "success_guarantee_id" uuid null, "extensions" varchar(255) not null, constraint "use_case_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('use_case', 'use_case');`);

        this.addSql(`create table "user_story" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(1000) not null, "solution_id" uuid not null, "last_modified" timestamptz not null default now(), "modified_by_id" uuid not null default 'ac594919-50e3-438a-b9bc-efb8a8654243', "is_silence" boolean not null default false, "priority" text check ("priority" in ('MUST', 'SHOULD', 'COULD', 'WONT')) not null, "primary_actor_id" uuid null, "follows_id" uuid null, "functional_behavior_id" uuid null, "outcome_id" uuid null, constraint "user_story_pkey" primary key ("id"));`);
        this.addSql(`select migrate_to_old_table('user_story', 'user_story');`);

        // cleanup function
        this.addSql(`drop function migrate_to_old_table;`);

        this.addSql(`alter table "silence" add constraint "silence_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "silence" add constraint "silence_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "role" add constraint "role_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "role" add constraint "role_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "responsibility" add constraint "responsibility_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "responsibility" add constraint "responsibility_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "product" add constraint "product_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "product" add constraint "product_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "parsed_requirement" add constraint "parsed_requirement_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "parsed_requirement" add constraint "parsed_requirement_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "person" add constraint "person_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "person" add constraint "person_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "person" add constraint "person_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "outcome" add constraint "outcome_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "outcome" add constraint "outcome_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "outcome" add constraint "outcome_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "obstacle" add constraint "obstacle_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "obstacle" add constraint "obstacle_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "obstacle" add constraint "obstacle_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "non_functional_behavior" add constraint "non_functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "non_functional_behavior" add constraint "non_functional_behavior_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "non_functional_behavior" add constraint "non_functional_behavior_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "noise" add constraint "noise_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "noise" add constraint "noise_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "limit" add constraint "limit_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "limit" add constraint "limit_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "limit" add constraint "limit_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "justification" add constraint "justification_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "justification" add constraint "justification_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "justification" add constraint "justification_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "invariant" add constraint "invariant_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "invariant" add constraint "invariant_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "invariant" add constraint "invariant_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "hint" add constraint "hint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "hint" add constraint "hint_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "glossary_term" add constraint "glossary_term_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "glossary_term" add constraint "glossary_term_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "glossary_term" add constraint "glossary_term_parent_component_id_foreign" foreign key ("parent_component_id") references "glossary_term" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "glossary_term" add constraint "glossary_term_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "functional_behavior" add constraint "functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "functional_behavior" add constraint "functional_behavior_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "functional_behavior" add constraint "functional_behavior_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "environment_component" add constraint "environment_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "environment_component" add constraint "environment_component_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "environment_component" add constraint "environment_component_parent_component_id_foreign" foreign key ("parent_component_id") references "environment_component" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "environment_component" add constraint "environment_component_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "effect" add constraint "effect_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "effect" add constraint "effect_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "effect" add constraint "effect_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "constraint" add constraint "constraint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "constraint" add constraint "constraint_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "constraint" add constraint "constraint_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "assumption" add constraint "assumption_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "assumption" add constraint "assumption_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "assumption" add constraint "assumption_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "stakeholder" add constraint "stakeholder_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "stakeholder" add constraint "stakeholder_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "stakeholder" add constraint "stakeholder_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "stakeholder" add constraint "stakeholder_parent_component_id_foreign" foreign key ("parent_component_id") references "stakeholder" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "system_component" add constraint "system_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "system_component" add constraint "system_component_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "system_component" add constraint "system_component_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "system_component" add constraint "system_component_parent_component_id_foreign" foreign key ("parent_component_id") references "system_component" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "task" add constraint "task_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "task" add constraint "task_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "test_case" add constraint "test_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "test_case" add constraint "test_case_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);

        this.addSql(`alter table "use_case" add constraint "use_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "use_case" add constraint "use_case_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "use_case" add constraint "use_case_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "use_case" add constraint "use_case_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "use_case" add constraint "use_case_precondition_id_foreign" foreign key ("precondition_id") references "assumption" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "use_case" add constraint "use_case_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "effect" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "user_story" add constraint "user_story_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
        this.addSql(`alter table "user_story" add constraint "user_story_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;`);
        this.addSql(`alter table "user_story" add constraint "user_story_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "user_story" add constraint "user_story_follows_id_foreign" foreign key ("follows_id") references "parsed_requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "user_story" add constraint "user_story_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "functional_behavior" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "user_story" add constraint "user_story_outcome_id_foreign" foreign key ("outcome_id") references "outcome" ("id") on update cascade on delete set null;`);

        this.addSql(`drop table if exists "requirement" cascade;`);

        this.addSql(`alter table "audit_log" alter column "entity" type jsonb using ("entity"::jsonb);`);
        this.addSql(`alter table "audit_log" alter column "entity" drop not null;`);
    }
}
