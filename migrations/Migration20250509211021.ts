import { Migration } from '@mikro-orm/migrations'

export class Migration20250509211021 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add column "parsed_requirements_id" uuid null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_parsed_requirements_id_foreign" foreign key ("parsed_requirements_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" drop constraint "requirement_parsed_requirements_id_foreign";`)

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" drop column "parsed_requirements_id";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }
}
