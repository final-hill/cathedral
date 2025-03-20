import { Migration } from '@mikro-orm/migrations';

export class Migration20250319024256 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop constraint if exists requirement_versions_availability_check;`);
        this.addSql(`alter table "requirement_versions" rename column "availability" to "interest";`);
        this.addSql(`alter table "requirement_versions" add constraint requirement_versions_interest_check check (interest >= 0 AND interest <= 100);`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_versions" drop constraint if exists requirement_versions_interest_check;`);
        this.addSql(`alter table "requirement_versions" rename column "interest" to "availability";`);
        this.addSql(`alter table "requirement_versions" add constraint requirement_versions_availability_check check (availability >= 0 AND availability <= 100);`);
    }

}
