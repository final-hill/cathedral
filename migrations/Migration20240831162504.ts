import { Migration } from '@mikro-orm/migrations'

export class Migration20240831162504 extends Migration {
    override async up(): Promise<void> {
        this.addSql('alter table "solution" drop constraint "solution_organization_id_foreign";')

        this.addSql('alter table "solution" add constraint "solution_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on update cascade;')
    }

    override async down(): Promise<void> {
        this.addSql('alter table "solution" drop constraint "solution_organization_id_foreign";')

        this.addSql('alter table "solution" add constraint "solution_organization_id_foreign" foreign key ("organization_id") references "organization" ("id") on delete cascade;')
    }
}
