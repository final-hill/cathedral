import { Migration } from '@mikro-orm/migrations';

export class Migration20251117152223 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_version_effective_from_re_246e0_unique";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_version_effective_from_re_246e0_unique" unique ("requirement_version_effective_from", "requirement_version_requirement_id", "endorsed_by_id", "category");`);
  }

}
