import { Migration } from '@mikro-orm/migrations'

export class Migration20251002180449 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`create table "person_stakeholders" ("person_id" uuid not null, "stakeholder_id" uuid not null, constraint "person_stakeholders_pkey" primary key ("person_id", "stakeholder_id"));`)

        this.addSql(`create table "person_roles" ("person_id" uuid not null, "role_id" uuid not null, constraint "person_roles_pkey" primary key ("person_id", "role_id"));`)

        this.addSql(`alter table "person_stakeholders" add constraint "person_stakeholders_person_id_foreign" foreign key ("person_id") references "requirement" ("id") on update cascade on delete cascade;`)
        this.addSql(`alter table "person_stakeholders" add constraint "person_stakeholders_stakeholder_id_foreign" foreign key ("stakeholder_id") references "requirement" ("id") on update cascade on delete cascade;`)

        this.addSql(`alter table "person_roles" add constraint "person_roles_person_id_foreign" foreign key ("person_id") references "requirement" ("id") on update cascade on delete cascade;`)
        this.addSql(`alter table "person_roles" add constraint "person_roles_role_id_foreign" foreign key ("role_id") references "requirement" ("id") on update cascade on delete cascade;`)

        this.addSql(`drop table if exists "requirement_stakeholders" cascade;`)

        this.addSql(`drop table if exists "requirement_roles" cascade;`)

        // Now assign Solution Creator persons to their roles using the new junction tables
        console.log('Adding role assignments for Solution Creator persons...')

        this.addSql(`
        -- Assign Solution Creator to Product Owner role for each solution
        INSERT INTO person_roles (person_id, role_id)
        SELECT 
            rv_person.requirement_id as person_id,
            rv_role.requirement_id as role_id
        FROM requirement_versions rv_person
        JOIN requirement_versions rv_role ON rv_person.solution_id = rv_role.solution_id
        WHERE rv_person.req_type = 'person'
          AND rv_person.name = 'Solution Creator'
          AND rv_person.workflow_state = 'Active'
          AND NOT rv_person.is_deleted
          AND rv_role.req_type = 'role'
          AND rv_role.name = 'Product Owner'
          AND rv_role.workflow_state = 'Active'
          AND NOT rv_role.is_deleted;
    `)

        this.addSql(`
        -- Assign Solution Creator to Implementation Owner role for each solution
        INSERT INTO person_roles (person_id, role_id)
        SELECT 
            rv_person.requirement_id as person_id,
            rv_role.requirement_id as role_id
        FROM requirement_versions rv_person
        JOIN requirement_versions rv_role ON rv_person.solution_id = rv_role.solution_id
        WHERE rv_person.req_type = 'person'
          AND rv_person.name = 'Solution Creator'
          AND rv_person.workflow_state = 'Active'
          AND NOT rv_person.is_deleted
          AND rv_role.req_type = 'role'
          AND rv_role.name = 'Implementation Owner'
          AND rv_role.workflow_state = 'Active'
          AND NOT rv_role.is_deleted;
    `)

        console.log('Completed role assignments for Solution Creator persons.')
    }

    override async down(): Promise<void> {
        this.addSql(`create table "requirement_stakeholders" ("requirement_model_id" uuid not null, constraint "requirement_stakeholders_pkey" primary key ("requirement_model_id"));`)

        this.addSql(`create table "requirement_roles" ("requirement_model_id" uuid not null, constraint "requirement_roles_pkey" primary key ("requirement_model_id"));`)

        this.addSql(`alter table "requirement_stakeholders" add constraint "requirement_stakeholders_requirement_model_id_foreign" foreign key ("requirement_model_id") references "requirement" ("id") on update cascade on delete cascade;`)

        this.addSql(`alter table "requirement_roles" add constraint "requirement_roles_requirement_model_id_foreign" foreign key ("requirement_model_id") references "requirement" ("id") on update cascade on delete cascade;`)

        this.addSql(`drop table if exists "person_stakeholders" cascade;`)

        this.addSql(`drop table if exists "person_roles" cascade;`)
    }
}
