import { Migration } from '@mikro-orm/migrations'

export class Migration20250924170133 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "endorsement" ("id" uuid not null, "requirement_id" uuid not null, "role_id" uuid not null, "status" text check ("status" in ('pending', 'endorsed', 'rejected')) not null, "endorsed_at" timestamptz null, "rejected_at" timestamptz null, "comments" text null, "endorsed_by_id" uuid null, constraint "endorsement_pkey" primary key ("id"));`)

        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_id_foreign" foreign key ("requirement_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_role_id_foreign" foreign key ("role_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_endorsed_by_id_foreign" foreign key ("endorsed_by_id") references "requirement" ("id") on update cascade on delete set null;`)

        this.addSql(`alter table "requirement_versions" add column "is_product_owner" boolean null default false, add column "is_implementation_owner" boolean null default false, add column "can_endorse_requirements" boolean null default false;`)
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "endorsement" cascade;`)

        this.addSql(`alter table "requirement_versions" drop column "is_product_owner", drop column "is_implementation_owner", drop column "can_endorse_requirements";`)
    }
}
