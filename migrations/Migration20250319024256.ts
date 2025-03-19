import { Migration } from '@mikro-orm/migrations';

export class Migration20250319024256 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "requirement_versions" rename column "availability" to "interest";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "requirement_versions" rename column "interest" to "availability";`);
  }

}
