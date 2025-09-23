import { Migration } from '@mikro-orm/migrations'

export class Migration20250923154147 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "requirement_stakeholders" ("requirement_model_id" uuid not null, constraint "requirement_stakeholders_pkey" primary key ("requirement_model_id"));`)

        this.addSql(`alter table "requirement_stakeholders" add constraint "requirement_stakeholders_requirement_model_id_foreign" foreign key ("requirement_model_id") references "requirement" ("id") on update cascade on delete cascade;`)
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "requirement_stakeholders" cascade;`)
    }
}
