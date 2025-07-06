import { Migration } from '@mikro-orm/migrations'

export class Migration20240724230321 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "app_role" ("name" varchar(100) not null, constraint "app_role_pkey" primary key ("name"));')

        this.addSql('create table "app_user" ("id" char(254) not null, "name" char(254) not null, "creation_date" timestamptz not null, "is_system_admin" boolean not null, constraint "app_user_pkey" primary key ("id"));')

        this.addSql('create table "organization" ("id" uuid not null, "name" varchar(100) not null, "description" varchar(255) not null, "slug" varchar(255) not null, constraint "organization_pkey" primary key ("id"));')
        this.addSql('alter table "organization" add constraint "organization_slug_unique" unique ("slug");')

        this.addSql('create table "app_user_organization_role" ("app_user_id" char(254) null, "organization_id" uuid null, "role_name" varchar(100) null, constraint "app_user_organization_role_pkey" primary key ("app_user_id", "organization_id", "role_name"));')

        this.addSql('create table "solution" ("id" uuid not null, "name" varchar(100) not null, "description" varchar(255) not null, "slug" varchar(255) not null, "organization_id" uuid not null, constraint "solution_pkey" primary key ("id"));')
        this.addSql('alter table "solution" add constraint "solution_slug_unique" unique ("slug");')

        this.addSql('create table "product" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "product_pkey" primary key ("id"));')

        this.addSql('create table "person" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "email" varchar(255) not null, constraint "person_pkey" primary key ("id"));')

        this.addSql('create table "outcome" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "outcome_pkey" primary key ("id"));')

        this.addSql('create table "obstacle" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "obstacle_pkey" primary key ("id"));')

        this.addSql('create table "non_functional_behavior" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, constraint "non_functional_behavior_pkey" primary key ("id"));')

        this.addSql('create table "limit" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "limit_pkey" primary key ("id"));')

        this.addSql('create table "justification" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "justification_pkey" primary key ("id"));')

        this.addSql('create table "invariant" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "invariant_pkey" primary key ("id"));')

        this.addSql('create table "hint" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "hint_pkey" primary key ("id"));')

        this.addSql('create table "glossary_term" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "parent_component_id" uuid null, constraint "glossary_term_pkey" primary key ("id"));')

        this.addSql('create table "functional_behavior" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, constraint "functional_behavior_pkey" primary key ("id"));')

        this.addSql('create table "environment_component" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "parent_component_id" uuid null, constraint "environment_component_pkey" primary key ("id"));')

        this.addSql('create table "effect" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "effect_pkey" primary key ("id"));')

        this.addSql('create table "constraint" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "category" text check ("category" in (\'Business Rule\', \'Physical Law\', \'Engineering Decision\')) not null, constraint "constraint_pkey" primary key ("id"));')

        this.addSql('create table "assumption" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "assumption_pkey" primary key ("id"));')

        this.addSql('create table "stakeholder" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "influence" int not null, "availability" int not null, "segmentation" text check ("segmentation" in (\'Client\', \'Vendor\')) not null, "category" text check ("category" in (\'Key Stakeholder\', \'Shadow Influencer\', \'Fellow Traveler\', \'Observer\')) not null, "parent_component_id" uuid null, constraint "stakeholder_pkey" primary key ("id"));')

        this.addSql('create table "system_component" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "parent_component_id" uuid null, constraint "system_component_pkey" primary key ("id"));')

        this.addSql('create table "use_case" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, "primary_actor_id" uuid not null, "scope" varchar(255) not null, "level" varchar(255) not null, "goal_in_context" varchar(255) not null, "precondition_id" uuid not null, "trigger_id" uuid not null, "main_success_scenario" varchar(255) not null, "success_guarantee_id" uuid not null, "extensions" varchar(255) not null, constraint "use_case_pkey" primary key ("id"));')

        this.addSql('create table "user_story" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, "primary_actor_id" uuid not null, "functional_behavior_id" uuid not null, "outcome_id" uuid not null, constraint "user_story_pkey" primary key ("id"));')

        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on delete cascade;')
        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on delete cascade;')
        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_role_name_foreign" foreign key ("role_name") references "app_role" ("name") on delete cascade;')

        this.addSql('alter table "solution" add constraint "solution_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on delete cascade;')

        this.addSql('alter table "product" add constraint "product_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "person" add constraint "person_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "outcome" add constraint "outcome_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "obstacle" add constraint "obstacle_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "non_functional_behavior" add constraint "non_functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "limit" add constraint "limit_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "justification" add constraint "justification_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "invariant" add constraint "invariant_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "hint" add constraint "hint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "glossary_term" add constraint "glossary_term_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
        this.addSql('alter table "glossary_term" add constraint "glossary_term_parent_component_id_foreign" foreign key ("parent_component_id") references "glossary_term" ("id") on update cascade on delete set null;')

        this.addSql('alter table "functional_behavior" add constraint "functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "environment_component" add constraint "environment_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
        this.addSql('alter table "environment_component" add constraint "environment_component_parent_component_id_foreign" foreign key ("parent_component_id") references "environment_component" ("id") on update cascade on delete set null;')

        this.addSql('alter table "effect" add constraint "effect_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "constraint" add constraint "constraint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "assumption" add constraint "assumption_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "stakeholder" add constraint "stakeholder_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
        this.addSql('alter table "stakeholder" add constraint "stakeholder_parent_component_id_foreign" foreign key ("parent_component_id") references "stakeholder" ("id") on update cascade on delete set null;')

        this.addSql('alter table "system_component" add constraint "system_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
        this.addSql('alter table "system_component" add constraint "system_component_parent_component_id_foreign" foreign key ("parent_component_id") references "system_component" ("id") on update cascade on delete set null;')

        this.addSql('alter table "use_case" add constraint "use_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
        this.addSql('alter table "use_case" add constraint "use_case_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade;')
        this.addSql('alter table "use_case" add constraint "use_case_precondition_id_foreign" foreign key ("precondition_id") references "assumption" ("id") on update cascade;')
        this.addSql('alter table "use_case" add constraint "use_case_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "effect" ("id") on update cascade;')

        this.addSql('alter table "user_story" add constraint "user_story_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
        this.addSql('alter table "user_story" add constraint "user_story_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade;')
        this.addSql('alter table "user_story" add constraint "user_story_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "functional_behavior" ("id") on update cascade;')
        this.addSql('alter table "user_story" add constraint "user_story_outcome_id_foreign" foreign key ("outcome_id") references "outcome" ("id") on update cascade;')
    }

    override async down(): Promise<void> {
        this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_role_name_foreign";')

        this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_app_user_id_foreign";')

        this.addSql('alter table "app_user_organization_role" drop constraint "app_user_organization_role_organization_id_foreign";')

        this.addSql('alter table "solution" drop constraint "solution_organization_id_foreign";')

        this.addSql('alter table "product" drop constraint "product_solution_id_foreign";')

        this.addSql('alter table "person" drop constraint "person_solution_id_foreign";')

        this.addSql('alter table "outcome" drop constraint "outcome_solution_id_foreign";')

        this.addSql('alter table "obstacle" drop constraint "obstacle_solution_id_foreign";')

        this.addSql('alter table "non_functional_behavior" drop constraint "non_functional_behavior_solution_id_foreign";')

        this.addSql('alter table "limit" drop constraint "limit_solution_id_foreign";')

        this.addSql('alter table "justification" drop constraint "justification_solution_id_foreign";')

        this.addSql('alter table "invariant" drop constraint "invariant_solution_id_foreign";')

        this.addSql('alter table "hint" drop constraint "hint_solution_id_foreign";')

        this.addSql('alter table "glossary_term" drop constraint "glossary_term_solution_id_foreign";')

        this.addSql('alter table "functional_behavior" drop constraint "functional_behavior_solution_id_foreign";')

        this.addSql('alter table "environment_component" drop constraint "environment_component_solution_id_foreign";')

        this.addSql('alter table "effect" drop constraint "effect_solution_id_foreign";')

        this.addSql('alter table "constraint" drop constraint "constraint_solution_id_foreign";')

        this.addSql('alter table "assumption" drop constraint "assumption_solution_id_foreign";')

        this.addSql('alter table "stakeholder" drop constraint "stakeholder_solution_id_foreign";')

        this.addSql('alter table "system_component" drop constraint "system_component_solution_id_foreign";')

        this.addSql('alter table "use_case" drop constraint "use_case_solution_id_foreign";')

        this.addSql('alter table "user_story" drop constraint "user_story_solution_id_foreign";')

        this.addSql('alter table "user_story" drop constraint "user_story_outcome_id_foreign";')

        this.addSql('alter table "glossary_term" drop constraint "glossary_term_parent_component_id_foreign";')

        this.addSql('alter table "user_story" drop constraint "user_story_functional_behavior_id_foreign";')

        this.addSql('alter table "environment_component" drop constraint "environment_component_parent_component_id_foreign";')

        this.addSql('alter table "use_case" drop constraint "use_case_success_guarantee_id_foreign";')

        this.addSql('alter table "use_case" drop constraint "use_case_precondition_id_foreign";')

        this.addSql('alter table "stakeholder" drop constraint "stakeholder_parent_component_id_foreign";')

        this.addSql('alter table "use_case" drop constraint "use_case_primary_actor_id_foreign";')

        this.addSql('alter table "user_story" drop constraint "user_story_primary_actor_id_foreign";')

        this.addSql('alter table "system_component" drop constraint "system_component_parent_component_id_foreign";')

        this.addSql('drop table if exists "app_role" cascade;')

        this.addSql('drop table if exists "app_user" cascade;')

        this.addSql('drop table if exists "organization" cascade;')

        this.addSql('drop table if exists "app_user_organization_role" cascade;')

        this.addSql('drop table if exists "solution" cascade;')

        this.addSql('drop table if exists "product" cascade;')

        this.addSql('drop table if exists "person" cascade;')

        this.addSql('drop table if exists "outcome" cascade;')

        this.addSql('drop table if exists "obstacle" cascade;')

        this.addSql('drop table if exists "non_functional_behavior" cascade;')

        this.addSql('drop table if exists "limit" cascade;')

        this.addSql('drop table if exists "justification" cascade;')

        this.addSql('drop table if exists "invariant" cascade;')

        this.addSql('drop table if exists "hint" cascade;')

        this.addSql('drop table if exists "glossary_term" cascade;')

        this.addSql('drop table if exists "functional_behavior" cascade;')

        this.addSql('drop table if exists "environment_component" cascade;')

        this.addSql('drop table if exists "effect" cascade;')

        this.addSql('drop table if exists "constraint" cascade;')

        this.addSql('drop table if exists "assumption" cascade;')

        this.addSql('drop table if exists "stakeholder" cascade;')

        this.addSql('drop table if exists "system_component" cascade;')

        this.addSql('drop table if exists "use_case" cascade;')

        this.addSql('drop table if exists "user_story" cascade;')
    }
}
