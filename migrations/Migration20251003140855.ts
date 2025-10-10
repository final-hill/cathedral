import { Migration } from '@mikro-orm/migrations'

export class Migration20251003140855 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" drop constraint "requirement_role_id_foreign";`)

        this.addSql(`alter table "endorsement" drop constraint "endorsement_role_id_foreign";`)
        this.addSql(`alter table "endorsement" drop constraint "endorsement_endorsed_by_id_foreign";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        // Delete existing endorsements that reference roles (since we're eliminating roles)
        this.addSql(`DELETE FROM endorsement;`)

        // Move any requirements in Review state back to Proposed state since their endorsements will be deleted
        this.addSql(`UPDATE requirement_versions SET workflow_state = 'Proposed' WHERE workflow_state = 'Review';`)

        // Delete existing role records and their versions before modifying schema
        this.addSql(`DELETE FROM requirement_versions WHERE req_type = 'role';`)
        this.addSql(`DELETE FROM requirement WHERE req_type = 'role';`)

        this.addSql(`alter table "requirement" drop column "role_id";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)

        this.addSql(`alter table "endorsement" drop column "role_id";`)

        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" drop default;`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" type uuid using ("endorsed_by_id"::text::uuid);`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" set not null;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_endorsed_by_id_foreign" foreign key ("endorsed_by_id") references "requirement" ("id") on update cascade;`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "endorsement" drop constraint "endorsement_endorsed_by_id_foreign";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add column "role_id" uuid null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_role_id_foreign" foreign key ("role_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)

        this.addSql(`alter table "endorsement" add column "role_id" uuid not null;`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" drop default;`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" type uuid using ("endorsed_by_id"::text::uuid);`)
        this.addSql(`alter table "endorsement" alter column "endorsed_by_id" drop not null;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_role_id_foreign" foreign key ("role_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_endorsed_by_id_foreign" foreign key ("endorsed_by_id") references "requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)
    }
}
