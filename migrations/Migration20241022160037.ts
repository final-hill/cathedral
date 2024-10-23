import { Migration } from '@mikro-orm/migrations';

export class Migration20241022160037 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint "requirement_parent_component_id_foreign";`);
        this.addSql(`alter table "requirement" drop constraint "requirement_parent_component_1_id_foreign";`);

        this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_left_1_id_foreign";`);
        this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_left_id_foreign";`);
        this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_right_id_foreign";`);

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
        `);

        // migrate non-null parent_component_id entries to "requirement_relation" table as rel_type = 'belongs'
        this.addSql(`
            insert into "requirement_relation" ("id", "left_id", "right_id", "rel_type")
            select uuid7(), "id", "parent_component_id", 'belongs'
            from "requirement"
            where "parent_component_id" is not null;
        `);

        this.addSql(`drop function uuid7();`);

        this.addSql(`alter table "requirement" drop column "parent_component_id", drop column "parent_component_1_id";`);

        this.addSql(`alter table "requirement_relation" drop column "left_1_id";`);

        this.addSql(`alter table "requirement_relation" alter column "left_id" drop default;`);
        this.addSql(`alter table "requirement_relation" alter column "left_id" type uuid using ("left_id"::text::uuid);`);
        this.addSql(`alter table "requirement_relation" alter column "left_id" drop not null;`);
        this.addSql(`alter table "requirement_relation" alter column "right_id" drop default;`);
        this.addSql(`alter table "requirement_relation" alter column "right_id" type uuid using ("right_id"::text::uuid);`);
        this.addSql(`alter table "requirement_relation" alter column "right_id" drop not null;`);
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_foreign" foreign key ("left_id") references "requirement" ("id") on delete cascade;`);
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_foreign" foreign key ("right_id") references "requirement" ("id") on delete cascade;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_left_id_foreign";`);
        this.addSql(`alter table "requirement_relation" drop constraint "requirement_relation_right_id_foreign";`);

        this.addSql(`alter table "requirement" add column "parent_component_id" uuid null, add column "parent_component_1_id" uuid null;`);

        this.addSql(`alter table "requirement" add constraint "requirement_parent_component_id_foreign" foreign key ("parent_component_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement" add constraint "requirement_parent_component_1_id_foreign" foreign key ("parent_component_1_id") references "requirement" ("id") on update cascade on delete set null;`);

        this.addSql(`alter table "requirement_relation" add column "left_1_id" uuid null;`);
        this.addSql(`alter table "requirement_relation" alter column "left_id" drop default;`);
        this.addSql(`alter table "requirement_relation" alter column "left_id" type uuid using ("left_id"::text::uuid);`);
        this.addSql(`alter table "requirement_relation" alter column "left_id" set not null;`);
        this.addSql(`alter table "requirement_relation" alter column "right_id" drop default;`);
        this.addSql(`alter table "requirement_relation" alter column "right_id" type uuid using ("right_id"::text::uuid);`);
        this.addSql(`alter table "requirement_relation" alter column "right_id" set not null;`);
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_1_id_foreign" foreign key ("left_1_id") references "requirement" ("id") on update cascade on delete set null;`);
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_left_id_foreign" foreign key ("left_id") references "requirement" ("id") on update cascade;`);
        this.addSql(`alter table "requirement_relation" add constraint "requirement_relation_right_id_foreign" foreign key ("right_id") references "requirement" ("id") on update cascade;`);
    }

}
