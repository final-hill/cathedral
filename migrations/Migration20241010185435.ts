import { Migration } from '@mikro-orm/migrations';

export class Migration20241010185435 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "audit_log" drop constraint "audit_log_solution_id_foreign";`);

    this.addSql(`alter table "audit_log" drop column "solution_id";`);

    this.addSql(`alter table "audit_log" add column "entity_name" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "audit_log" drop column "entity_name";`);

    this.addSql(`alter table "audit_log" add column "solution_id" uuid not null;`);
    this.addSql(`alter table "audit_log" add constraint "audit_log_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
  }

}
