import { Migration } from '@mikro-orm/migrations'

export class Migration20250923144149 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "requirement_roles" ("requirement_model_id" uuid not null, constraint "requirement_roles_pkey" primary key ("requirement_model_id"));`)

        this.addSql(`alter table "requirement_roles" add constraint "requirement_roles_requirement_model_id_foreign" foreign key ("requirement_model_id") references "requirement" ("id") on update cascade on delete cascade;`)
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "requirement_roles" cascade;`)
    }
}
