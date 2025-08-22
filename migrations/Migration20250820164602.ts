import { Migration } from '@mikro-orm/migrations'

export class Migration20250820164602 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_parent_component_effective__e6046_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_precondition_id_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_success_guarantee_id_foreign";`)

        this.addSql(`alter table "requirement" add column "scenario_step_id" uuid null, add column "parent_scenario_id" uuid null, add column "use_case_id" uuid null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_scenario_step_id_foreign" foreign key ("scenario_step_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_parent_scenario_id_foreign" foreign key ("parent_scenario_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_use_case_id_foreign" foreign key ("use_case_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction_requirement', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" drop column "parent_component_effective_from", drop column "parent_component_requirement_id", drop column "scope", drop column "level", drop column "precondition_id", drop column "main_success_scenario", drop column "success_guarantee_id", drop column "extensions";`)

        this.addSql(`alter table "requirement_versions" add column "parent_component_id" uuid null, add column "step_number" varchar(255) null, add column "step_type" text check ("step_type" in ('Action', 'Condition')) null, add column "scope_id" uuid null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_parent_component_id_foreign" foreign key ("parent_component_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_scope_id_foreign" foreign key ("scope_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction_requirement', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" drop constraint "requirement_scenario_step_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_parent_scenario_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_use_case_id_foreign";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_parent_component_id_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_scope_id_foreign";`)

        this.addSql(`alter table "requirement" drop column "scenario_step_id", drop column "parent_scenario_id", drop column "use_case_id";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" drop column "parent_component_id", drop column "step_type", drop column "scope_id";`)

        this.addSql(`alter table "requirement_versions" add column "parent_component_effective_from" timestamptz null, add column "parent_component_requirement_id" uuid null, add column "level" varchar(255) null, add column "precondition_id" uuid null, add column "main_success_scenario" varchar(255) null, add column "success_guarantee_id" uuid null, add column "extensions" varchar(255) null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_precondition_id_foreign" foreign key ("precondition_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
        this.addSql(`alter table "requirement_versions" rename column "step_number" to "scope";`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_parent_component_effective__e6046_foreign" foreign key ("parent_component_effective_from", "parent_component_requirement_id") references "requirement_versions" ("effective_from", "requirement_id") on update cascade on delete set null;`)
    }
}
