import { Migration } from '@mikro-orm/migrations';

export class Migration20250321235413 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`);

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`);

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`);

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'situation', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`);

        this.addSql(`update "requirement_versions" set "req_type" = 'situation', "name" = 'Situation', "req_id" = 'G.2.0' where "req_type" = 'obstacle' and "name" = 'G.2';`);
        this.addSql(`update "requirement" set "req_type" = 'situation' where "id" in (select "requirement_id" from "requirement_versions" where "req_type" = 'situation' and "name" = 'Situation');`);
    }

    override async down(): Promise<void> {
        this.addSql(`update "requirement_versions" set "req_type" = 'obstacle', "name" = 'G.2' where "req_type" = 'situation' and "name" = 'G.2.0';`);
        this.addSql(`update "requirement" set "req_type" = 'obstacle' where "id" in (select "requirement_id" from "requirement_versions" where "req_type" = 'obstacle' and "name" = 'G.2');`);

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`);

        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`);

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`);

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`);

    }

}
