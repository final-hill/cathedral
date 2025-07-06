import { Migration } from '@mikro-orm/migrations'

export class Migration20241002233803 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "app_user" alter column "name" type varchar(254) using ("name"::varchar(254));`)
        this.addSql(`alter table "app_user" alter column "email" type varchar(254) using ("email"::varchar(254));`)

        this.addSql(`alter table "person" alter column "email" type varchar(254) using ("email"::varchar(254));`)

        this.addSql(`alter table "stakeholder" add constraint stakeholder_availability_check check(availability >= 0 AND availability <= 100);`)
        this.addSql(`alter table "stakeholder" add constraint stakeholder_influence_check check(influence >= 0 AND influence <= 100);`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "app_user" alter column "name" type char(254) using ("name"::char(254));`)
        this.addSql(`alter table "app_user" alter column "email" type char(254) using ("email"::char(254));`)

        this.addSql(`alter table "person" alter column "email" type varchar(255) using ("email"::varchar(255));`)

        this.addSql(`alter table "stakeholder" drop constraint stakeholder_availability_check;`)
        this.addSql(`alter table "stakeholder" drop constraint stakeholder_influence_check;`)
    }
}
