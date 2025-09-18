import { Migration } from '@mikro-orm/migrations'

export class Migration20250902214733 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "requirement_behaviors" ("requirement_model_id" uuid not null, constraint "requirement_behaviors_pkey" primary key ("requirement_model_id"));`)

        this.addSql(`alter table "requirement_behaviors" add constraint "requirement_behaviors_requirement_model_id_foreign" foreign key ("requirement_model_id") references "requirement" ("id") on update cascade on delete cascade;`)
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "requirement_behaviors" cascade;`)
    }
}
