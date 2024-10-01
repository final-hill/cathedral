import { Migration } from '@mikro-orm/migrations';

export class Migration20241001203320 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "silence" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "product" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "parsed_requirement" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "person" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "outcome" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "obstacle" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "non_functional_behavior" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "noise" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "limit" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "justification" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "invariant" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "hint" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "glossary_term" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "functional_behavior" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "environment_component" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "effect" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "constraint" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "assumption" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "stakeholder" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "system_component" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "use_case" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);

    this.addSql(`alter table "user_story" alter column "statement" type varchar(1000) using ("statement"::varchar(1000));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "silence" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "product" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "parsed_requirement" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "person" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "outcome" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "obstacle" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "non_functional_behavior" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "noise" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "limit" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "justification" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "invariant" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "hint" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "glossary_term" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "functional_behavior" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "environment_component" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "effect" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "constraint" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "assumption" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "stakeholder" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "system_component" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "use_case" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);

    this.addSql(`alter table "user_story" alter column "statement" type varchar(255) using ("statement"::varchar(255));`);
  }

}
