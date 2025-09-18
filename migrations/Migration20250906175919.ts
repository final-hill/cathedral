import { Migration } from '@mikro-orm/migrations'

export class Migration20250906175919 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_initiator_id_foreign";`)
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_interface_id_foreign";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)

        this.addSql(`alter table "requirement_versions" drop column "initiator_id", drop column "interface_id", drop column "payload_schema", drop column "kind", drop column "schema";`)

        this.addSql(`alter table "requirement_versions" add column "definition" text null, add column "version" varchar(255) null;`)
        this.addSql(`alter table "requirement_versions" alter column "format" type text using ("format"::text);`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_format_check" check("format" in ('JSON_SCHEMA'));`)
        this.addSql(`alter table "requirement_versions" rename column "type_name" to "schema_name";`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_format_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_data_type', 'interface_flow'));`)

        this.addSql(`alter table "requirement_versions" drop column "version";`)

        this.addSql(`alter table "requirement_versions" add column "initiator_id" uuid null, add column "interface_id" uuid null, add column "kind" text check ("kind" in ('Primitive', 'Product', 'Sum', 'Collection')) null, add column "schema" text null;`)
        this.addSql(`alter table "requirement_versions" alter column "format" type varchar(255) using ("format"::varchar(255));`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_initiator_id_foreign" foreign key ("initiator_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_interface_id_foreign" foreign key ("interface_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'event', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_data_type', 'interface_flow'));`)
        this.addSql(`alter table "requirement_versions" rename column "definition" to "payload_schema";`)
        this.addSql(`alter table "requirement_versions" rename column "schema_name" to "type_name";`)
    }
}
