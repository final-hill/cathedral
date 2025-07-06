import { Migration } from '@mikro-orm/migrations'

export class Migration20250322190637 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`update "requirement_versions" set "req_type" = 'context_and_objective', "name" = 'Context And Objective', "req_id" = 'G.1.0' where "req_type" = 'outcome' and "name" = 'G.1';`)
        this.addSql(`update "requirement" set "req_type" = 'context_and_objective' where "id" in (select "requirement_id" from "requirement_versions" where "req_type" = 'context_and_objective' and "req_id" = 'G.1.0');`)
    }

    override async down(): Promise<void> {
        this.addSql(`update "requirement_versions" set "req_type" = 'outcome', "name" = 'G.1', "req_id" = 'G.1' where "req_type" = 'context_and_objective' and "name" = 'Context And Objective' and "req_id" = 'G.1.0';`)
        this.addSql(`update "requirement" set "req_type" = 'outcome' where "id" in (select "requirement_id" from "requirement_versions" where "req_type" = 'outcome' and "req_id" = 'G.1');`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }
}
