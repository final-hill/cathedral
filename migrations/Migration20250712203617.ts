import { Migration } from '@mikro-orm/migrations'

export class Migration20250712203617 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`drop table if exists "app_credentials" cascade;`)
    }

    override async down(): Promise<void> {
        this.addSql(`create table "app_credentials" ("id" varchar(1023) not null, "app_user_id" uuid not null, "public_key" varchar(512) not null, "counter" int not null, "backed_up" boolean not null, "transports" jsonb null, constraint "app_credentials_pkey" primary key ("id", "app_user_id"));`)

        this.addSql(`alter table "app_credentials" add constraint "app_credentials_app_user_id_foreign" foreign key ("app_user_id") references "app_user" ("id") on update cascade;`)
    }
}
