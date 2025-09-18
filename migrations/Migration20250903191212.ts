import { Migration } from '@mikro-orm/migrations'

export class Migration20250903191212 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`drop table if exists "requirement_behaviors" cascade;`)

        this.addSql(`alter table "requirement" add column "interface_id" uuid null, add column "behavior_id" uuid null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_interface_id_foreign" foreign key ("interface_id") references "requirement" ("id") on update cascade on delete set null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_behavior_id_foreign" foreign key ("behavior_id") references "requirement" ("id") on update cascade on delete set null;`)
    }

    override async down(): Promise<void> {
        this.addSql(`create table "requirement_behaviors" ("requirement_model_id" uuid not null, constraint "requirement_behaviors_pkey" primary key ("requirement_model_id"));`)

        this.addSql(`alter table "requirement_behaviors" add constraint "requirement_behaviors_requirement_model_id_foreign" foreign key ("requirement_model_id") references "requirement" ("id") on update cascade on delete cascade;`)

        this.addSql(`alter table "requirement" drop constraint "requirement_interface_id_foreign";`)
        this.addSql(`alter table "requirement" drop constraint "requirement_behavior_id_foreign";`)

        this.addSql(`alter table "requirement" drop column "interface_id", drop column "behavior_id";`)
    }
}
