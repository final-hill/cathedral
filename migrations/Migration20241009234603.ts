import { Migration } from '@mikro-orm/migrations';

export class Migration20241009234603 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "audit_log" add column "solution_id" uuid not null, add column "entity_id" uuid not null;`);
    this.addSql(`alter table "audit_log" add constraint "audit_log_solution_id_foreign" foreign key ("solution_id") references "solution" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "audit_log" drop constraint "audit_log_solution_id_foreign";`);

    this.addSql(`alter table "audit_log" drop column "solution_id", drop column "entity_id";`);
  }

}
