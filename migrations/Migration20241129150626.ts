import { Migration } from '@mikro-orm/migrations';

export class Migration20241129150626 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_left_id_foreign";`);
    this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_right_id_foreign";`);

    this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_pkey";`);
    this.addSql(`alter table "requirement_relation" drop column "id";`);

    this.addSql(`alter table "requirement_relation" alter column "left_id" drop default;`);
    this.addSql(`alter table "requirement_relation" alter column "left_id" type uuid using ("left_id"::text::uuid);`);
    this.addSql(`alter table "requirement_relation" alter column "left_id" set not null;`);
    this.addSql(`alter table "requirement_relation" alter column "right_id" drop default;`);
    this.addSql(`alter table "requirement_relation" alter column "right_id" type uuid using ("right_id"::text::uuid);`);
    this.addSql(`alter table "requirement_relation" alter column "right_id" set not null;`);
    this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_foreign" foreign key ("left_id") references "requirement" ("id") on update cascade;`);
    this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_foreign" foreign key ("right_id") references "requirement" ("id") on update cascade;`);
    this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_pkey" primary key ("left_id", "right_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_left_id_foreign";`);
    this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_right_id_foreign";`);

    this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_pkey";`);

    this.addSql(`alter table "requirement_relation" add column "id" uuid not null;`);
    this.addSql(`alter table "requirement_relation" alter column "left_id" drop default;`);
    this.addSql(`alter table "requirement_relation" alter column "left_id" type uuid using ("left_id"::text::uuid);`);
    this.addSql(`alter table "requirement_relation" alter column "left_id" drop not null;`);
    this.addSql(`alter table "requirement_relation" alter column "right_id" drop default;`);
    this.addSql(`alter table "requirement_relation" alter column "right_id" type uuid using ("right_id"::text::uuid);`);
    this.addSql(`alter table "requirement_relation" alter column "right_id" drop not null;`);
    this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_foreign" foreign key ("left_id") references "requirement" ("id") on delete cascade;`);
    this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_foreign" foreign key ("right_id") references "requirement" ("id") on delete cascade;`);
    this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_pkey" primary key ("id");`);
  }

}
