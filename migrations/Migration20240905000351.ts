import { Migration } from '@mikro-orm/migrations'

export class Migration20240905000351 extends Migration {
    override async up(): Promise<void> {
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

        this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop default;')
        this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);')
        this.addSql('alter table "app_user_organization_role" alter column "app_user_id" set not null;')
        this.addSql('alter table "app_user_organization_role" alter column "organization_id" drop default;')
        this.addSql('alter table "app_user_organization_role" alter column "organization_id" type uuid using ("organization_id"::text::uuid);')
        this.addSql('alter table "app_user_organization_role" alter column "organization_id" set not null;')
        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;')
        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;')

        this.addSql('alter table "solution" alter column "organization_id" drop default;')
        this.addSql('alter table "solution" alter column "organization_id" type uuid using ("organization_id"::text::uuid);')
        this.addSql('alter table "solution" alter column "organization_id" set not null;')
        this.addSql('alter table "solution" add constraint "solution_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;')

        this.addSql('alter table "product" alter column "solution_id" drop default;')
        this.addSql('alter table "product" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "product" alter column "solution_id" set not null;')
        this.addSql('alter table "product" add constraint "product_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "person" alter column "solution_id" drop default;')
        this.addSql('alter table "person" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "person" alter column "solution_id" set not null;')
        this.addSql('alter table "person" add constraint "person_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "outcome" alter column "solution_id" drop default;')
        this.addSql('alter table "outcome" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "outcome" alter column "solution_id" set not null;')
        this.addSql('alter table "outcome" add constraint "outcome_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "obstacle" alter column "solution_id" drop default;')
        this.addSql('alter table "obstacle" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "obstacle" alter column "solution_id" set not null;')
        this.addSql('alter table "obstacle" add constraint "obstacle_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "non_functional_behavior" alter column "solution_id" drop default;')
        this.addSql('alter table "non_functional_behavior" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "non_functional_behavior" alter column "solution_id" set not null;')
        this.addSql('alter table "non_functional_behavior" add constraint "non_functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "limit" alter column "solution_id" drop default;')
        this.addSql('alter table "limit" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "limit" alter column "solution_id" set not null;')
        this.addSql('alter table "limit" add constraint "limit_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "justification" alter column "solution_id" drop default;')
        this.addSql('alter table "justification" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "justification" alter column "solution_id" set not null;')
        this.addSql('alter table "justification" add constraint "justification_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "invariant" alter column "solution_id" drop default;')
        this.addSql('alter table "invariant" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "invariant" alter column "solution_id" set not null;')
        this.addSql('alter table "invariant" add constraint "invariant_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "hint" alter column "solution_id" drop default;')
        this.addSql('alter table "hint" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "hint" alter column "solution_id" set not null;')
        this.addSql('alter table "hint" add constraint "hint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "glossary_term" alter column "solution_id" drop default;')
        this.addSql('alter table "glossary_term" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "glossary_term" alter column "solution_id" set not null;')
        this.addSql('alter table "glossary_term" add constraint "glossary_term_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "functional_behavior" alter column "solution_id" drop default;')
        this.addSql('alter table "functional_behavior" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "functional_behavior" alter column "solution_id" set not null;')
        this.addSql('alter table "functional_behavior" add constraint "functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "environment_component" alter column "solution_id" drop default;')
        this.addSql('alter table "environment_component" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "environment_component" alter column "solution_id" set not null;')
        this.addSql('alter table "environment_component" add constraint "environment_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "effect" alter column "solution_id" drop default;')
        this.addSql('alter table "effect" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "effect" alter column "solution_id" set not null;')
        this.addSql('alter table "effect" add constraint "effect_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "constraint" alter column "solution_id" drop default;')
        this.addSql('alter table "constraint" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "constraint" alter column "solution_id" set not null;')
        this.addSql('alter table "constraint" add constraint "constraint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "assumption" alter column "solution_id" drop default;')
        this.addSql('alter table "assumption" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "assumption" alter column "solution_id" set not null;')
        this.addSql('alter table "assumption" add constraint "assumption_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "stakeholder" alter column "solution_id" drop default;')
        this.addSql('alter table "stakeholder" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "stakeholder" alter column "solution_id" set not null;')
        this.addSql('alter table "stakeholder" add constraint "stakeholder_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "system_component" alter column "solution_id" drop default;')
        this.addSql('alter table "system_component" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "system_component" alter column "solution_id" set not null;')
        this.addSql('alter table "system_component" add constraint "system_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "use_case" alter column "solution_id" drop default;')
        this.addSql('alter table "use_case" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "use_case" alter column "solution_id" set not null;')
        this.addSql('alter table "use_case" add constraint "use_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')

        this.addSql('alter table "user_story" alter column "solution_id" drop default;')
        this.addSql('alter table "user_story" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "user_story" alter column "solution_id" set not null;')
        this.addSql('alter table "user_story" add constraint "user_story_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;')
    }

    override async down(): Promise<void> {
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

        this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop default;')
        this.addSql('alter table "app_user_organization_role" alter column "app_user_id" type uuid using ("app_user_id"::text::uuid);')
        this.addSql('alter table "app_user_organization_role" alter column "app_user_id" drop not null;')
        this.addSql('alter table "app_user_organization_role" alter column "organization_id" drop default;')
        this.addSql('alter table "app_user_organization_role" alter column "organization_id" type uuid using ("organization_id"::text::uuid);')
        this.addSql('alter table "app_user_organization_role" alter column "organization_id" drop not null;')
        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on delete cascade;')
        this.addSql('alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on delete cascade;')

        this.addSql('alter table "solution" alter column "organization_id" drop default;')
        this.addSql('alter table "solution" alter column "organization_id" type uuid using ("organization_id"::text::uuid);')
        this.addSql('alter table "solution" alter column "organization_id" drop not null;')
        this.addSql('alter table "solution" add constraint "solution_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on delete cascade;')

        this.addSql('alter table "product" alter column "solution_id" drop default;')
        this.addSql('alter table "product" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "product" alter column "solution_id" drop not null;')
        this.addSql('alter table "product" add constraint "product_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "person" alter column "solution_id" drop default;')
        this.addSql('alter table "person" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "person" alter column "solution_id" drop not null;')
        this.addSql('alter table "person" add constraint "person_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "outcome" alter column "solution_id" drop default;')
        this.addSql('alter table "outcome" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "outcome" alter column "solution_id" drop not null;')
        this.addSql('alter table "outcome" add constraint "outcome_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "obstacle" alter column "solution_id" drop default;')
        this.addSql('alter table "obstacle" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "obstacle" alter column "solution_id" drop not null;')
        this.addSql('alter table "obstacle" add constraint "obstacle_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "non_functional_behavior" alter column "solution_id" drop default;')
        this.addSql('alter table "non_functional_behavior" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "non_functional_behavior" alter column "solution_id" drop not null;')
        this.addSql('alter table "non_functional_behavior" add constraint "non_functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "limit" alter column "solution_id" drop default;')
        this.addSql('alter table "limit" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "limit" alter column "solution_id" drop not null;')
        this.addSql('alter table "limit" add constraint "limit_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "justification" alter column "solution_id" drop default;')
        this.addSql('alter table "justification" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "justification" alter column "solution_id" drop not null;')
        this.addSql('alter table "justification" add constraint "justification_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "invariant" alter column "solution_id" drop default;')
        this.addSql('alter table "invariant" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "invariant" alter column "solution_id" drop not null;')
        this.addSql('alter table "invariant" add constraint "invariant_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "hint" alter column "solution_id" drop default;')
        this.addSql('alter table "hint" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "hint" alter column "solution_id" drop not null;')
        this.addSql('alter table "hint" add constraint "hint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "glossary_term" alter column "solution_id" drop default;')
        this.addSql('alter table "glossary_term" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "glossary_term" alter column "solution_id" drop not null;')
        this.addSql('alter table "glossary_term" add constraint "glossary_term_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "functional_behavior" alter column "solution_id" drop default;')
        this.addSql('alter table "functional_behavior" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "functional_behavior" alter column "solution_id" drop not null;')
        this.addSql('alter table "functional_behavior" add constraint "functional_behavior_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "environment_component" alter column "solution_id" drop default;')
        this.addSql('alter table "environment_component" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "environment_component" alter column "solution_id" drop not null;')
        this.addSql('alter table "environment_component" add constraint "environment_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "effect" alter column "solution_id" drop default;')
        this.addSql('alter table "effect" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "effect" alter column "solution_id" drop not null;')
        this.addSql('alter table "effect" add constraint "effect_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "constraint" alter column "solution_id" drop default;')
        this.addSql('alter table "constraint" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "constraint" alter column "solution_id" drop not null;')
        this.addSql('alter table "constraint" add constraint "constraint_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "assumption" alter column "solution_id" drop default;')
        this.addSql('alter table "assumption" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "assumption" alter column "solution_id" drop not null;')
        this.addSql('alter table "assumption" add constraint "assumption_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "stakeholder" alter column "solution_id" drop default;')
        this.addSql('alter table "stakeholder" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "stakeholder" alter column "solution_id" drop not null;')
        this.addSql('alter table "stakeholder" add constraint "stakeholder_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "system_component" alter column "solution_id" drop default;')
        this.addSql('alter table "system_component" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "system_component" alter column "solution_id" drop not null;')
        this.addSql('alter table "system_component" add constraint "system_component_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "use_case" alter column "solution_id" drop default;')
        this.addSql('alter table "use_case" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "use_case" alter column "solution_id" drop not null;')
        this.addSql('alter table "use_case" add constraint "use_case_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')

        this.addSql('alter table "user_story" alter column "solution_id" drop default;')
        this.addSql('alter table "user_story" alter column "solution_id" type uuid using ("solution_id"::text::uuid);')
        this.addSql('alter table "user_story" alter column "solution_id" drop not null;')
        this.addSql('alter table "user_story" add constraint "user_story_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on delete cascade;')
    }
}
