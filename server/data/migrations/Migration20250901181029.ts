import { Migration } from '@mikro-orm/migrations'

export class Migration20250901181029 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        // Update existing data: rename interaction_requirement to interaction
        this.addSql(`update "requirement" set "req_type" = 'interaction' where "req_type" = 'interaction_requirement';`)
        this.addSql(`update "requirement_versions" set "req_type" = 'interaction' where "req_type" = 'interaction_requirement';`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_data_type', 'interface_flow'));`)

        this.addSql(`alter table "requirement_versions" add column "initiator_id" uuid null, add column "interface_id" uuid null, add column "payload_schema" text null, add column "type_name" varchar(255) null, add column "kind" text check ("kind" in ('Primitive', 'Product', 'Sum', 'Collection')) null, add column "schema" text null, add column "flow_name" varchar(255) null, add column "states" text[] null default '{}', add column "initial_state" varchar(255) null, add column "final_states" text[] null default '{}', add column "transitions" text null, add column "input_name" varchar(255) null, add column "required" boolean null default false, add column "operation_id" varchar(255) null, add column "constraints" varchar(255) null, add column "verb" varchar(255) null, add column "path" varchar(255) null, add column "output_name" varchar(255) null, add column "data_type" varchar(255) null, add column "format" varchar(255) null, add column "interface_type" text check ("interface_type" in ('API', 'CLI', 'UI')) null;`)
        this.addSql(`alter table "requirement_versions" alter column "description" type text using ("description"::text);`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_initiator_id_foreign" foreign key ("initiator_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_interface_id_foreign" foreign key ("interface_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_data_type', 'interface_flow'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_initiator_id_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_interface_id_foreign";`)

        // Rollback data migration: rename interaction back to interaction_requirement
        this.addSql(`update "requirement" set "req_type" = 'interaction_requirement' where "req_type" = 'interaction';`)
        this.addSql(`update "requirement_versions" set "req_type" = 'interaction_requirement' where "req_type" = 'interaction';`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction_requirement', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" drop column "initiator_id", drop column "interface_id", drop column "payload_schema", drop column "type_name", drop column "kind", drop column "schema", drop column "flow_name", drop column "states", drop column "initial_state", drop column "final_states", drop column "transitions", drop column "input_name", drop column "required", drop column "operation_id", drop column "constraints", drop column "verb", drop column "path", drop column "output_name", drop column "data_type", drop column "format", drop column "interface_type";`)

        this.addSql(`alter table "requirement_versions" alter column "description" type varchar(1000) using ("description"::varchar(1000));`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction_requirement', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }
}
