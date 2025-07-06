import { Migration } from '@mikro-orm/migrations'

export class Migration20241015215709 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "requirement_relation" ("id" uuid not null, "left_id" uuid not null, "right_id" uuid not null, "rel_type" text check ("rel_type" in ('belongs', 'characterizes', 'constrains', 'contradicts', 'details', 'disjoins', 'duplicates', 'excepts', 'explains', 'extends', 'follows', 'repeats', 'shares')) not null, "left_1_id" uuid null, constraint "requirement_relation_pkey" primary key ("id"));`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_unique" unique ("left_id");`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_unique" unique ("right_id");`)
        this.addSql(`create index "requirement_relation_rel_type_index" on "requirement_relation" ("rel_type");`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_1_id_unique" unique ("left_1_id");`)

        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_foreign" foreign key ("left_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_foreign" foreign key ("right_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_1_id_foreign" foreign key ("left_1_id") references "requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('assumption', 'constraint', 'effect', 'environment_component', 'functional_behavior', 'glossary_term', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'outcome', 'parsed_requirement', 'person', 'product', 'responsibility', 'role', 'silence', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "requirement_relation" cascade;`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('assumption', 'constraint', 'effect', 'environment_component', 'functional_behavior', 'glossary_term', 'hint', 'invariant', 'justification', 'limit', 'noise', 'non_functional_behavior', 'obstacle', 'outcome', 'parsed_requirement', 'person', 'product', 'responsibility', 'role', 'silence', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
    }
}
