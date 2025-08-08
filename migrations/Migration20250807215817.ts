import { Migration } from '@mikro-orm/migrations'

export class Migration20250807215817 extends Migration {
    override async up(): Promise<void> {
    // Convert any existing 'situation' requirements to 'obstacle'
        this.addSql(`update "requirement" set "req_type" = 'obstacle' where "req_type" = 'situation';`)
        this.addSql(`update "requirement_versions" set "req_type" = 'obstacle' where "req_type" = 'situation';`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        // Note: We cannot perfectly reverse the situation -> obstacle conversion
        // as we don't track which obstacles were originally situations
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }
}
