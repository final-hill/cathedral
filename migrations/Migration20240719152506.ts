import { Migration } from '@mikro-orm/migrations';

export class Migration20240719152506 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "solution" ("id" uuid not null, "description" varchar(255) not null, "name" varchar(60) not null, "slug" varchar(255) not null, constraint "solution_pkey" primary key ("id"));');
    this.addSql('alter table "solution" add constraint "solution_slug_unique" unique ("slug");');
  }

}
