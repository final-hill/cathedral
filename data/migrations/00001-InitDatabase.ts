import type { PGliteInterface } from "@electric-sql/pglite";
import Migration from "../Migration";

export default class InitDatabase_00001 extends Migration {
    async up(db: PGliteInterface): Promise<void> {
        const sql = `
            CREATE SCHEMA cathedral;
            SET search_path TO cathedral;

            -- ref: https://gist.github.com/kjmph/5bd772b2c2df145aa645b837da7eca74
            -- Awaiting the following native function to be added:
            --    https://commitfest.postgresql.org/43/4388/
            create or replace function xuuid7()
            returns uuid
            as $$
            begin
            -- use random v4 uuid as starting point (which has the same variant we need)
            -- then overlay timestamp
            -- then set version 7 by flipping the 2 and 1 bit in the version 4 string
            return encode(
                set_bit(
                set_bit(
                    overlay(uuid_send(gen_random_uuid())
                            placing substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
                            from 1 for 6
                    ),
                    52, 1
                ),
                53, 1
                ),
                'hex')::uuid;
            end
            $$
            language plpgsql
            volatile;

            CREATE TABLE __migration_history (Name TEXT PRIMARY KEY);

            CREATE TABLE solution (
                id UUID PRIMARY KEY DEFAULT xuuid7(),
                name VARCHAR(60) NOT NULL,
                description VARCHAR(200) NOT NULL,
                slug VARCHAR(60) NOT NULL
            );

            CREATE TABLE requirement (
                id UUID PRIMARY KEY DEFAULT xuuid7(),
                solution_id UUID NOT NULL REFERENCES solution(id) ON DELETE CASCADE,
                name VARCHAR(60) NOT NULL,
                statement VARCHAR(200) NOT NULL,
                property VARCHAR(200) NOT NULL
            );

            CREATE TABLE goal (
            -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE "limit" (
                    -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE outcome (
                -- Additional columns can be added here if needed
            )
            INHERITS (goal);

            CREATE TABLE obstacle (
                -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE assumption (
                -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE constraint_category (
                id UUID PRIMARY KEY DEFAULT xuuid7(),
                name VARCHAR(60) NOT NULL
            );

            INSERT INTO constraint_category (id, name) VALUES (xuuid7(), 'Business Rule');
            INSERT INTO constraint_category (id, name) VALUES (xuuid7(), 'Physical Law');
            INSERT INTO constraint_category (id, name) VALUES (xuuid7(), 'Engineering Decision');

            CREATE TABLE "constraint" (
                category_id UUID REFERENCES constraint_category(id)
            )
            INHERITS (requirement);

            CREATE TABLE effect (
                -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE invariant (
                -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE actor (
                -- Additional columns can be added here if needed
            )
            INHERITS (requirement);

            CREATE TABLE component (
                parent_component_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
            )
            INHERITS (actor);

            CREATE TABLE glossary_term (
                -- Additional columns can be added here if needed
            )
            INHERITS (component);

            CREATE TABLE stakeholder_segmentation (
                id UUID PRIMARY KEY DEFAULT xuuid7(),
                name VARCHAR(60) NOT NULL
            );

            INSERT INTO stakeholder_segmentation (id, name) VALUES (xuuid7(), 'Client');
            INSERT INTO stakeholder_segmentation (id, name) VALUES (xuuid7(), 'Vendor');

            CREATE TABLE stakeholder_category (
                id UUID PRIMARY KEY DEFAULT xuuid7(),
                name VARCHAR(60) NOT NULL
            );

            INSERT INTO stakeholder_category (id, name) VALUES (xuuid7(), 'Key Stakeholder');
            INSERT INTO stakeholder_category (id, name) VALUES (xuuid7(), 'Shadow Influencer');
            INSERT INTO stakeholder_category (id, name) VALUES (xuuid7(), 'Fellow Traveler');
            INSERT INTO stakeholder_category (id, name) VALUES (xuuid7(), 'Observer');

            CREATE TABLE stakeholder (
                -- id UUID PRIMARY KEY DEFAULT xuuid7(), -- causes when explicitly defined
                influence smallint NOT NULL,
                availability smallint NOT NULL,
                segmentation_id UUID REFERENCES stakeholder_segmentation(id),
                category_id UUID REFERENCES stakeholder_category(id)
            ) INHERITS (component);

            CREATE TABLE person (
                email VARCHAR(60) NOT NULL,
                role_id UUID NOT NULL
                -- role_id UUID NOT NULL REFERENCES stakeholder(id) -- throws error stakeholder does not redefine id
            )
            INHERITS (actor);

            CREATE TABLE behavior (
                component_id UUID NOT NULL
                -- component_id UUID NOT NULL REFERENCES component(id) ON DELETE CASCADE
            )
            INHERITS (requirement);

            CREATE TABLE functional_behavior (
                -- Additional columns can be added here if needed
            )
            INHERITS (behavior);

            CREATE TABLE non_functional_behavior (
                -- Additional columns can be added here if needed
            )
            INHERITS (behavior);

            CREATE table example (
                -- Additional columns can be added here if needed
            )
            INHERITS (behavior);

            CREATE table scenario (
                -- primary_actor_id UUID NOT NULL REFERENCES actor(id)
                primary_actor_id UUID NOT NULL
            )
            INHERITS (example);

            CREATE TABLE user_story (
                -- outcome_id UUID NOT NULL REFERENCES outcome(id),
                -- functional_behavior_id UUID NOT NULL REFERENCES functional_behavior(id)
                outcome_id UUID NOT NULL,
                functional_behavior_id UUID NOT NULL
            )
            INHERITS (scenario);

            CREATE TABLE use_case (
                scope VARCHAR(60) NOT NULL,
                level VARCHAR(60) NOT NULL,
                goal_in_context VARCHAR(200) NOT NULL,
                -- pre_condition_id UUID NOT NULL REFERENCES assumption(id),
                pre_condition_id UUID NOT NULL,
                trigger_id UUID NOT NULL,
                main_success_scenario VARCHAR(200) NOT NULL,
                -- success_guarantee_id UUID NOT NULL REFERENCES effect(id),
                success_guarantee_id UUID NOT NULL,
                extensions VARCHAR(200) NOT NULL
            )
            INHERITS (scenario);
`

        await db.exec(sql)
    }

    async down(db: PGliteInterface): Promise<void> {
        const sql = `
            DROP SCHEMA cathedral CASCADE;
        `;

        await db.exec(sql);
    }
}