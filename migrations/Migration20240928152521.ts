import { Migration } from '@mikro-orm/migrations';

export class Migration20240928152521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "use_case" drop constraint "use_case_primary_actor_id_foreign";`);
    this.addSql(`alter table "use_case" drop constraint "use_case_precondition_id_foreign";`);
    this.addSql(`alter table "use_case" drop constraint "use_case_success_guarantee_id_foreign";`);

    this.addSql(`alter table "user_story" drop constraint "user_story_primary_actor_id_foreign";`);
    this.addSql(`alter table "user_story" drop constraint "user_story_functional_behavior_id_foreign";`);
    this.addSql(`alter table "user_story" drop constraint "user_story_outcome_id_foreign";`);

    this.addSql(`alter table "person" alter column "email" type varchar(255) using ("email"::varchar(255));`);
    this.addSql(`alter table "person" alter column "email" drop not null;`);

    this.addSql(`alter table "use_case" alter column "primary_actor_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "primary_actor_id" type uuid using ("primary_actor_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "primary_actor_id" drop not null;`);
    this.addSql(`alter table "use_case" alter column "precondition_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "precondition_id" type uuid using ("precondition_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "precondition_id" drop not null;`);
    this.addSql(`alter table "use_case" alter column "trigger_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "trigger_id" type uuid using ("trigger_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "trigger_id" drop not null;`);
    this.addSql(`alter table "use_case" alter column "success_guarantee_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "success_guarantee_id" type uuid using ("success_guarantee_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "success_guarantee_id" drop not null;`);
    this.addSql(`alter table "use_case" add constraint "use_case_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "use_case" add constraint "use_case_precondition_id_foreign" foreign key ("precondition_id") references "assumption" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "use_case" add constraint "use_case_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "effect" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "user_story" alter column "primary_actor_id" drop default;`);
    this.addSql(`alter table "user_story" alter column "primary_actor_id" type uuid using ("primary_actor_id"::text::uuid);`);
    this.addSql(`alter table "user_story" alter column "primary_actor_id" drop not null;`);
    this.addSql(`alter table "user_story" alter column "functional_behavior_id" drop default;`);
    this.addSql(`alter table "user_story" alter column "functional_behavior_id" type uuid using ("functional_behavior_id"::text::uuid);`);
    this.addSql(`alter table "user_story" alter column "functional_behavior_id" drop not null;`);
    this.addSql(`alter table "user_story" alter column "outcome_id" drop default;`);
    this.addSql(`alter table "user_story" alter column "outcome_id" type uuid using ("outcome_id"::text::uuid);`);
    this.addSql(`alter table "user_story" alter column "outcome_id" drop not null;`);
    this.addSql(`alter table "user_story" add constraint "user_story_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "user_story" add constraint "user_story_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "functional_behavior" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "user_story" add constraint "user_story_outcome_id_foreign" foreign key ("outcome_id") references "outcome" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "use_case" drop constraint "use_case_primary_actor_id_foreign";`);
    this.addSql(`alter table "use_case" drop constraint "use_case_precondition_id_foreign";`);
    this.addSql(`alter table "use_case" drop constraint "use_case_success_guarantee_id_foreign";`);

    this.addSql(`alter table "user_story" drop constraint "user_story_primary_actor_id_foreign";`);
    this.addSql(`alter table "user_story" drop constraint "user_story_functional_behavior_id_foreign";`);
    this.addSql(`alter table "user_story" drop constraint "user_story_outcome_id_foreign";`);

    this.addSql(`alter table "person" alter column "email" type varchar(255) using ("email"::varchar(255));`);
    this.addSql(`alter table "person" alter column "email" set not null;`);

    this.addSql(`alter table "use_case" alter column "primary_actor_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "primary_actor_id" type uuid using ("primary_actor_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "primary_actor_id" set not null;`);
    this.addSql(`alter table "use_case" alter column "precondition_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "precondition_id" type uuid using ("precondition_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "precondition_id" set not null;`);
    this.addSql(`alter table "use_case" alter column "trigger_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "trigger_id" type uuid using ("trigger_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "trigger_id" set not null;`);
    this.addSql(`alter table "use_case" alter column "success_guarantee_id" drop default;`);
    this.addSql(`alter table "use_case" alter column "success_guarantee_id" type uuid using ("success_guarantee_id"::text::uuid);`);
    this.addSql(`alter table "use_case" alter column "success_guarantee_id" set not null;`);
    this.addSql(`alter table "use_case" add constraint "use_case_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade;`);
    this.addSql(`alter table "use_case" add constraint "use_case_precondition_id_foreign" foreign key ("precondition_id") references "assumption" ("id") on update cascade;`);
    this.addSql(`alter table "use_case" add constraint "use_case_success_guarantee_id_foreign" foreign key ("success_guarantee_id") references "effect" ("id") on update cascade;`);

    this.addSql(`alter table "user_story" alter column "primary_actor_id" drop default;`);
    this.addSql(`alter table "user_story" alter column "primary_actor_id" type uuid using ("primary_actor_id"::text::uuid);`);
    this.addSql(`alter table "user_story" alter column "primary_actor_id" set not null;`);
    this.addSql(`alter table "user_story" alter column "functional_behavior_id" drop default;`);
    this.addSql(`alter table "user_story" alter column "functional_behavior_id" type uuid using ("functional_behavior_id"::text::uuid);`);
    this.addSql(`alter table "user_story" alter column "functional_behavior_id" set not null;`);
    this.addSql(`alter table "user_story" alter column "outcome_id" drop default;`);
    this.addSql(`alter table "user_story" alter column "outcome_id" type uuid using ("outcome_id"::text::uuid);`);
    this.addSql(`alter table "user_story" alter column "outcome_id" set not null;`);
    this.addSql(`alter table "user_story" add constraint "user_story_primary_actor_id_foreign" foreign key ("primary_actor_id") references "stakeholder" ("id") on update cascade;`);
    this.addSql(`alter table "user_story" add constraint "user_story_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "functional_behavior" ("id") on update cascade;`);
    this.addSql(`alter table "user_story" add constraint "user_story_outcome_id_foreign" foreign key ("outcome_id") references "outcome" ("id") on update cascade;`);
  }

}
