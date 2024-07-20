import { Migration } from '@mikro-orm/migrations';

export class Migration20240720212912 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "product" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "product_pkey" primary key ("id"));');

    this.addSql('create table "person" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "email" varchar(255) not null, constraint "person_pkey" primary key ("id"));');

    this.addSql('create table "outcome" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "outcome_pkey" primary key ("id"));');

    this.addSql('create table "obstacle" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "obstacle_pkey" primary key ("id"));');

    this.addSql('create table "non_functional_behavior" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, constraint "non_functional_behavior_pkey" primary key ("id"));');

    this.addSql('create table "limit" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "limit_pkey" primary key ("id"));');

    this.addSql('create table "justification" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "justification_pkey" primary key ("id"));');

    this.addSql('create table "invariant" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "invariant_pkey" primary key ("id"));');

    this.addSql('create table "hint" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "hint_pkey" primary key ("id"));');

    this.addSql('create table "glossary_term" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "parent_component_id" uuid null, constraint "glossary_term_pkey" primary key ("id"));');

    this.addSql('create table "functional_behavior" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, constraint "functional_behavior_pkey" primary key ("id"));');

    this.addSql('create table "environment_component" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "parent_component_id" uuid null, constraint "environment_component_pkey" primary key ("id"));');

    this.addSql('create table "effect" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "effect_pkey" primary key ("id"));');

    this.addSql('create table "constraint" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "category" text check ("category" in (\'Business Rule\', \'Physical Law\', \'Engineering Decision\')) not null, constraint "constraint_pkey" primary key ("id"));');

    this.addSql('create table "assumption" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, constraint "assumption_pkey" primary key ("id"));');

    this.addSql('create table "stakeholder" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "parent_component_id" uuid null, "segmentation" text check ("segmentation" in (\'Client\', \'Vendor\')) not null, "category" text check ("category" in (\'Key Stakeholder\', \'Shadow Influencer\', \'Fellow Traveler\', \'Observer\')) not null, "availability" int not null, "influence" int not null, constraint "stakeholder_pkey" primary key ("id"), constraint stakeholder_availability_check check (availability >= 0 AND availability <= 100), constraint stakeholder_influence_check check (influence >= 0 AND influence <= 100));');

    this.addSql('create table "use_case" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, "primary_actor_id" uuid not null, "scope" varchar(255) not null, "level" varchar(255) not null, "goal_in_context" varchar(255) not null, "precondition_id" uuid not null, "trigger_id" varchar(255) not null, "main_success_scenario" varchar(255) not null, "success_guarantee_id" uuid not null, "extensions" varchar(255) not null, constraint "use_case_pkey" primary key ("id"));');

    this.addSql('create table "user_story" ("id" uuid not null, "name" varchar(255) not null, "statement" varchar(255) not null, "solution_id" uuid not null, "priority" text check ("priority" in (\'MUST\', \'SHOULD\', \'COULD\', \'WONT\')) not null, "primary_actor_id" uuid not null, "functional_behavior_id" uuid not null, "outcome_id" uuid not null, constraint "user_story_pkey" primary key ("id"));');

    this.addSql('alter table "product" add constraint "product_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "person" add constraint "person_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "outcome" add constraint "outcome_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "obstacle" add constraint "obstacle_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "non_functional_behavior" add constraint "non_functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "limit" add constraint "limit_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "justification" add constraint "justification_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "invariant" add constraint "invariant_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "hint" add constraint "hint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "glossary_term" add constraint "glossary_term_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');
    this.addSql('alter table "glossary_term" add constraint "glossary_term_parent_component_id_foreign" foreign key ("parent_component_id") references "glossary_term" ("id") on update cascade on delete set null;');

    this.addSql('alter table "functional_behavior" add constraint "functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "environment_component" add constraint "environment_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');
    this.addSql('alter table "environment_component" add constraint "environment_component_parent_component_id_foreign" foreign key ("parent_component_id") references "environment_component" ("id") on update cascade on delete set null;');

    this.addSql('alter table "effect" add constraint "effect_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "constraint" add constraint "constraint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "assumption" add constraint "assumption_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');

    this.addSql('alter table "stakeholder" add constraint "stakeholder_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');
    this.addSql('alter table "stakeholder" add constraint "stakeholder_parent_component_id_foreign" foreign key ("parent_component_id") references "stakeholder" ("id") on update cascade on delete set null;');

    this.addSql('alter table "use_case" add constraint "use_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');
    this.addSql('alter table "use_case" add constraint "use_case_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade;');
    this.addSql('alter table "use_case" add constraint "use_case_precondition_id_foreign" foreign key ("precondition_id") references "assumption" ("id") on update cascade;');
    this.addSql('alter table "use_case" add constraint "use_case_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "effect" ("id") on update cascade;');

    this.addSql('alter table "user_story" add constraint "user_story_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;');
    this.addSql('alter table "user_story" add constraint "user_story_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade;');
    this.addSql('alter table "user_story" add constraint "user_story_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "functional_behavior" ("id") on update cascade;');
    this.addSql('alter table "user_story" add constraint "user_story_outcome_id_foreign" foreign key ("outcome_id") references "outcome" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_story" drop constraint "user_story_outcome_id_foreign";');

    this.addSql('alter table "glossary_term" drop constraint "glossary_term_parent_component_id_foreign";');

    this.addSql('alter table "user_story" drop constraint "user_story_functional_behavior_id_foreign";');

    this.addSql('alter table "environment_component" drop constraint "environment_component_parent_component_id_foreign";');

    this.addSql('alter table "use_case" drop constraint "use_case_success_guarantee_id_foreign";');

    this.addSql('alter table "use_case" drop constraint "use_case_precondition_id_foreign";');

    this.addSql('alter table "stakeholder" drop constraint "stakeholder_parent_component_id_foreign";');

    this.addSql('alter table "use_case" drop constraint "use_case_primary_actor_id_foreign";');

    this.addSql('alter table "user_story" drop constraint "user_story_primary_actor_id_foreign";');

    this.addSql('drop table if exists "product" cascade;');

    this.addSql('drop table if exists "person" cascade;');

    this.addSql('drop table if exists "outcome" cascade;');

    this.addSql('drop table if exists "obstacle" cascade;');

    this.addSql('drop table if exists "non_functional_behavior" cascade;');

    this.addSql('drop table if exists "limit" cascade;');

    this.addSql('drop table if exists "justification" cascade;');

    this.addSql('drop table if exists "invariant" cascade;');

    this.addSql('drop table if exists "hint" cascade;');

    this.addSql('drop table if exists "glossary_term" cascade;');

    this.addSql('drop table if exists "functional_behavior" cascade;');

    this.addSql('drop table if exists "environment_component" cascade;');

    this.addSql('drop table if exists "effect" cascade;');

    this.addSql('drop table if exists "constraint" cascade;');

    this.addSql('drop table if exists "assumption" cascade;');

    this.addSql('drop table if exists "stakeholder" cascade;');

    this.addSql('drop table if exists "use_case" cascade;');

    this.addSql('drop table if exists "user_story" cascade;');
  }

}
