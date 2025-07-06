import { Migration } from '@mikro-orm/migrations'

export class Migration20240903022539 extends Migration {
    override async up(): Promise<void> {
        this.addSql('alter table "product" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "product" add constraint "product_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "person" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "person" add constraint "person_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "outcome" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "outcome" add constraint "outcome_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "obstacle" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "obstacle" add constraint "obstacle_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "non_functional_behavior" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "non_functional_behavior" add constraint "non_functional_behavior_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "limit" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "limit" add constraint "limit_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "justification" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "justification" add constraint "justification_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "invariant" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "invariant" add constraint "invariant_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "hint" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "hint" add constraint "hint_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "glossary_term" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "glossary_term" add constraint "glossary_term_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "functional_behavior" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "functional_behavior" add constraint "functional_behavior_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "environment_component" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "environment_component" add constraint "environment_component_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "effect" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "effect" add constraint "effect_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "constraint" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "constraint" add constraint "constraint_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "assumption" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "assumption" add constraint "assumption_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "stakeholder" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "stakeholder" add constraint "stakeholder_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "system_component" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "system_component" add constraint "system_component_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "use_case" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "use_case" add constraint "use_case_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')

        this.addSql('alter table "user_story" add column "last_modified" timestamptz not null default now(), add column "modified_by_id" uuid not null default \'ac594919-50e3-438a-b9bc-efb8a8654243\';')
        this.addSql('alter table "user_story" add constraint "user_story_modified_by_id_foreign" foreign key ("modified_by_id") references "app_user" ("id") on update cascade;')
    }

    override async down(): Promise<void> {
        this.addSql('alter table "product" drop constraint "product_modified_by_id_foreign";')

        this.addSql('alter table "person" drop constraint "person_modified_by_id_foreign";')

        this.addSql('alter table "outcome" drop constraint "outcome_modified_by_id_foreign";')

        this.addSql('alter table "obstacle" drop constraint "obstacle_modified_by_id_foreign";')

        this.addSql('alter table "non_functional_behavior" drop constraint "non_functional_behavior_modified_by_id_foreign";')

        this.addSql('alter table "limit" drop constraint "limit_modified_by_id_foreign";')

        this.addSql('alter table "justification" drop constraint "justification_modified_by_id_foreign";')

        this.addSql('alter table "invariant" drop constraint "invariant_modified_by_id_foreign";')

        this.addSql('alter table "hint" drop constraint "hint_modified_by_id_foreign";')

        this.addSql('alter table "glossary_term" drop constraint "glossary_term_modified_by_id_foreign";')

        this.addSql('alter table "functional_behavior" drop constraint "functional_behavior_modified_by_id_foreign";')

        this.addSql('alter table "environment_component" drop constraint "environment_component_modified_by_id_foreign";')

        this.addSql('alter table "effect" drop constraint "effect_modified_by_id_foreign";')

        this.addSql('alter table "constraint" drop constraint "constraint_modified_by_id_foreign";')

        this.addSql('alter table "assumption" drop constraint "assumption_modified_by_id_foreign";')

        this.addSql('alter table "stakeholder" drop constraint "stakeholder_modified_by_id_foreign";')

        this.addSql('alter table "system_component" drop constraint "system_component_modified_by_id_foreign";')

        this.addSql('alter table "use_case" drop constraint "use_case_modified_by_id_foreign";')

        this.addSql('alter table "user_story" drop constraint "user_story_modified_by_id_foreign";')

        this.addSql('alter table "product" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "person" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "outcome" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "obstacle" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "non_functional_behavior" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "limit" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "justification" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "invariant" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "hint" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "glossary_term" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "functional_behavior" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "environment_component" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "effect" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "constraint" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "assumption" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "stakeholder" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "system_component" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "use_case" drop column "last_modified", drop column "modified_by_id";')

        this.addSql('alter table "user_story" drop column "last_modified", drop column "modified_by_id";')
    }
}
