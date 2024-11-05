import { Migration } from '@mikro-orm/migrations';

export class Migration20241105190126 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" add column "created_by_id" uuid not null default '00000000-0000-0000-0000-000000000000';`);
        this.addSql(`update "requirement" set "created_by_id" = "modified_by_id";`);
        this.addSql(`alter table "requirement" alter column "created_by_id" drop default;`);
        this.addSql(`alter table "requirement" alter column "modified_by_id" drop default;`);
        this.addSql(`alter table "requirement" alter column "modified_by_id" drop default;`);
        this.addSql(`alter table "requirement" alter column "modified_by_id" type uuid using ("modified_by_id"::text::uuid);`);
        this.addSql(`alter table "requirement" add constraint "requirement_created_by_id_foreign" foreign key ("created_by_id") references "app_user" ("id") on update cascade;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint "requirement_created_by_id_foreign";`);

        this.addSql(`alter table "requirement" drop column "created_by_id";`);

        this.addSql(`alter table "requirement" alter column "modified_by_id" drop default;`);
        this.addSql(`alter table "requirement" alter column "modified_by_id" type uuid using ("modified_by_id"::text::uuid);`);
        this.addSql(`alter table "requirement" alter column "modified_by_id" set default 'ac594919-50e3-438a-b9bc-efb8a8654243';`);
    }
}
