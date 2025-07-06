import { Migration } from '@mikro-orm/migrations'

export class Migration20241020164456 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "app_user_organization_role" drop constraint if exists "app_user_organization_role_organization_id_foreign";`)

        this.addSql(`alter table "solution" drop constraint if exists "solution_organization_id_foreign";`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_solution_id_foreign";`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" drop constraint if exists "requirement_follows_id_foreign";`)

        this.addSql(`alter table "app_user_organization_role" drop constraint if exists "app_user_organization_role_organization_id_foreign";`)

        this.addSql(`alter table "requirement" add column "slug" varchar(255) null;`)
        this.addSql(`alter table "requirement" alter column "name" type varchar(100) using ("name"::varchar(100));`)
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)
        this.addSql(`alter table "requirement" rename column "statement" to "description";`)
        this.addSql(`alter table "requirement" add constraint "requirement_slug_unique" unique ("slug");`)

        // Postgres v16 does not support uuid v7
        // source: https://gist.github.com/fabiolimace/515a0440e3e40efeb234e12644a6a346#file-uuidv7-sql
        this.addSql(`
            create or replace function uuid7() returns uuid as $$
            declare
            begin
                return uuid7(clock_timestamp());
            end $$ language plpgsql;

            create or replace function uuid7(p_timestamp timestamp with time zone) returns uuid as $$
            declare

                v_time double precision := null;

                v_unix_t bigint := null;
                v_rand_a bigint := null;
                v_rand_b bigint := null;

                v_unix_t_hex varchar := null;
                v_rand_a_hex varchar := null;
                v_rand_b_hex varchar := null;

                c_milli double precision := 10^3;  -- 1 000
                c_micro double precision := 10^6;  -- 1 000 000
                c_scale double precision := 4.096; -- 4.0 * (1024 / 1000)

                c_version bigint := x'0000000000007000'::bigint; -- RFC-9562 version: b'0111...'
                c_variant bigint := x'8000000000000000'::bigint; -- RFC-9562 variant: b'10xx...'

            begin

                v_time := extract(epoch from p_timestamp);

                v_unix_t := trunc(v_time * c_milli);
                v_rand_a := trunc((v_time * c_micro - v_unix_t * c_milli) * c_scale);
                v_rand_b := trunc(random() * 2^30)::bigint << 32 | trunc(random() * 2^32)::bigint;

                v_unix_t_hex := lpad(to_hex(v_unix_t), 12, '0');
                v_rand_a_hex := lpad(to_hex((v_rand_a | c_version)::bigint), 4, '0');
                v_rand_b_hex := lpad(to_hex((v_rand_b | c_variant)::bigint), 16, '0');

                return (v_unix_t_hex || v_rand_a_hex || v_rand_b_hex)::uuid;

            end $$ language plpgsql;
        `)

        this.addSql(`alter table "requirement_relation" drop constraint if exists "requirement_relation_left_id_unique";`)
        this.addSql(`alter table "requirement_relation" drop constraint if exists "requirement_relation_right_id_unique";`)
        this.addSql(`alter table "requirement_relation" drop constraint if exists "requirement_relation_left_1_id_unique";`)

        // Copy records from "organization" table to "requirement" table
        this.addSql(`
            insert into "requirement" (id, description, name, slug, req_type, solution_id)
            select id, description, name, slug, 'organization' as req_type, '00000000-0000-0000-0000-000000000000' as solution_id
            from "organization";
        `)

        // Copy records from "solution" table to "requirement" table
        // Note the abuse of "organization_id" as "solution_id"
        // this is because it will later be generalized to the "requirement_relation" table as "belongs"
        this.addSql(`
            insert into "requirement" (id, description, name, slug, req_type, solution_id)
            select id, description, name, slug, 'solution' as req_type, organization_id as solution_id
            from "solution";
        `)

        // Migrate non-null "follows_id" entries to "requirement_relation" table
        this.addSql(`
            insert into "requirement_relation" (id, left_id, right_id, rel_type)
            select uuid7(), id, follows_id, 'follows'
            from "requirement"
            where follows_id is not null;
        `)

        // Migrate "solution_id" entries to "requirement_relation" table, ignoring empty UUIDs and NULLs
        this.addSql(`
            insert into "requirement_relation" (id, left_id, right_id, rel_type)
            select uuid7(), id, solution_id, 'belongs'
            from "requirement"
            where solution_id is not null and solution_id != '00000000-0000-0000-0000-000000000000';
        `)

        this.addSql(`drop table if exists "organization" cascade;`)
        this.addSql(`drop table if exists "solution" cascade;`)

        this.addSql(`drop function uuid7();`)

        this.addSql(`alter table "requirement" drop column "solution_id", drop column "follows_id";`)

        this.addSql(`alter table "app_user_organization_role" add constraint "app_user_organization_role_organization_id_foreign" foreign key ("organization_id") references "requirement" ("id") on update cascade;`)
    }

    override async down(): Promise<void> {
        // Recreate "organization" and "solution" tables
        this.addSql(`
            create table "organization" (
                id uuid primary key,
                name varchar(255) not null,
                description text,
                slug varchar(255) unique
            );
        `)

        this.addSql(`
            create table "solution" (
                id uuid primary key,
                name varchar(255) not null,
                description text,
                slug varchar(255) unique,
                organization_id uuid references "organization" ("id") on delete set null
            );
        `)

        // Restore "solution_id" and "follows_id" columns to the "requirement" table
        this.addSql(`alter table "requirement" add column "solution_id" uuid;`)
        this.addSql(`alter table "requirement" add column "follows_id" uuid;`)

        // Migrate "belongs" relationships back to "solution_id" column
        this.addSql(`
            update "requirement" r
            set solution_id = rr.right_id
            from "requirement_relation" rr
            where rr.left_id = r.id and rr.rel_type = 'belongs';
        `)

        // Migrate "follows" relationships back to "follows_id" column
        this.addSql(`
            update "requirement" r
            set follows_id = rr.right_id
            from "requirement_relation" rr
            where rr.left_id = r.id and rr.rel_type = 'follows';
        `)

        // Insert back data into "organization" table
        this.addSql(`
            insert into "organization" (id, name, description, slug)
            select id, name, description, slug
            from "requirement"
            where req_type = 'organization';
        `)

        // Insert back data into "solution" table
        this.addSql(`
            insert into "solution" (id, name, description, slug, organization_id)
            select id, name, description, slug, solution_id
            from "requirement"
            where req_type = 'solution';
        `)

        // Drop the "requirement_relation" entries related to follows and belongs
        this.addSql(`
            delete from "requirement_relation"
            where rel_type in ('follows', 'belongs');
        `)

        // Drop constraints and columns added to the "requirement" table
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_slug_unique";`)
        this.addSql(`alter table "requirement" drop column if exists "slug";`)
        this.addSql(`alter table "requirement" rename column "description" to "statement";`)

        // Restore original length of the "name" column
        this.addSql(`alter table "requirement" alter column "name" type varchar(255) using ("name"::varchar(255));`)

        // Drop the added req_type check constraint
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        // Drop the re-created foreign key constraint on "app_user_organization_role"
        this.addSql(`
            alter table "app_user_organization_role" drop constraint if exists "app_user_organization_role_organization_id_foreign";
        `)

        // Restore the original foreign key constraints
        this.addSql(`
            alter table "app_user_organization_role"
            add constraint "app_user_organization_role_organization_id_foreign"
            foreign key ("organization_id") references "organization" ("id") on update cascade;
        `)

        this.addSql(`
            alter table "solution"
            add constraint "solution_organization_id_foreign"
            foreign key ("organization_id") references "organization" ("id") on delete set null;
        `)

        this.addSql(`
            alter table "requirement"
            add constraint "requirement_solution_id_foreign"
            foreign key ("solution_id") references "solution" ("id") on delete set null;
        `)

        this.addSql(`
            alter table "requirement"
            add constraint "requirement_follows_id_foreign"
            foreign key ("follows_id") references "requirement" ("id") on delete set null;
        `)

        // Recreate unique constraints for "requirement_relation" if they existed before
        this.addSql(`
            alter table "requirement_relation"
            add constraint "requirement_relation_left_id_unique" unique ("left_id");
        `)

        this.addSql(`
            alter table "requirement_relation"
            add constraint "requirement_relation_right_id_unique" unique ("right_id");
        `)

        this.addSql(`
            alter table "requirement_relation"
            add constraint "requirement_relation_left_1_id_unique" unique ("left_id");
        `)
    }
}
