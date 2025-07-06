import { Migration } from '@mikro-orm/migrations'

export class Migration20250503193420 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "app_credentials" alter column "id" type text using ("id"::text);`)

        this.addSql(`alter table "app_credentials" alter column "id" type varchar(1023) using ("id"::varchar(1023));`)
        this.addSql(`alter table "app_credentials" alter column "public_key" type varchar(512) using ("public_key"::varchar(512));`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "app_credentials" alter column "id" drop default;`)
        this.addSql(`alter table "app_credentials" alter column "id" type uuid using ("id"::text::uuid);`)
        this.addSql(`alter table "app_credentials" alter column "public_key" type varchar(255) using ("public_key"::varchar(255));`)
    }
}
