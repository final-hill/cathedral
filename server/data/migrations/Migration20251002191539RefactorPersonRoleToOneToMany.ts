import { Migration } from '@mikro-orm/migrations'

export class Migration20251002191539RefactorPersonRoleToOneToMany extends Migration {
    override async up(): Promise<void> {
    // First, add the new role_id column to the requirement table
        this.addSql(`alter table "requirement" add column "role_id" uuid null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_role_id_foreign" foreign key ("role_id") references "requirement" ("id") on update cascade on delete set null;`)

        // Migrate existing person-role assignments from junction table to foreign key
        // For each person-role assignment, update the person to reference the role directly
        this.addSql(`
      UPDATE requirement 
      SET role_id = pr.role_id
      FROM person_roles pr
      WHERE requirement.id = pr.person_id
        AND requirement.req_type = 'person'
    `)

        // Drop the junction table after migrating data
        this.addSql(`drop table if exists "person_roles" cascade;`)
    }

    override async down(): Promise<void> {
        this.addSql(`create table "person_roles" ("person_id" uuid not null, "role_id" uuid not null, constraint "person_roles_pkey" primary key ("person_id", "role_id"));`)

        this.addSql(`alter table "person_roles" add constraint "person_roles_person_id_foreign" foreign key ("person_id") references "requirement" ("id") on update cascade on delete cascade;`)
        this.addSql(`alter table "person_roles" add constraint "person_roles_role_id_foreign" foreign key ("role_id") references "requirement" ("id") on update cascade on delete cascade;`)

        this.addSql(`alter table "requirement" drop constraint "requirement_role_id_foreign";`)

        this.addSql(`alter table "requirement" drop column "role_id";`)
    }
}
