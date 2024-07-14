BEGIN;

CREATE SCHEMA cathedral;

SET
	search_path TO cathedral;

-- ref: https://gist.github.com/kjmph/5bd772b2c2df145aa645b837da7eca74
-- Awaiting the following native function to be added:
--    https://commitfest.postgresql.org/43/4388/
CREATE
OR REPLACE FUNCTION xuuid7() RETURNS uuid AS $$
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
$$ LANGUAGE PLPGSQL VOLATILE;

CREATE TABLE __migration_history (
	name TEXT PRIMARY KEY
              NOT NULL,
	execution_date TEXT NOT NULL
);

CREATE TABLE solution (
	id UUID PRIMARY KEY
            DEFAULT xuuid7(),
	name TEXT NOT NULL
              CHECK (LENGTH(NAME) <= 60),
	description TEXT NOT NULL
                     CHECK (LENGTH(DESCRIPTION) <= 200),
	slug TEXT NOT NULL
              GENERATED ALWAYS AS (
                  LOWER(REPLACE(REPLACE(TRIM(NAME), ' ', '-'), '--', '-'))
              ) STORED
);

CREATE TABLE requirement (
	id UUID PRIMARY KEY
            DEFAULT xuuid7(),
	name TEXT NOT NULL,
	solution_id UUID REFERENCES solution (id)
                     ON DELETE CASCADE
                     NOT NULL,
	STATEMENT TEXT NOT NULL
);

CREATE TABLE actor (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE assumption (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE component (
    id UUID PRIMARY KEY
            REFERENCES actor (ID)
            ON DELETE CASCADE,
    parent_component_id UUID REFERENCES component (id)
                        ON DELETE RESTRICT
);

CREATE TABLE behavior (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE,
	priority_id TEXT NOT NULL
        CHECK (priority_id IN ('MUST', 'SHOULD', 'COULD', 'WONT'))
        DEFAULT ('MUST')
);

CREATE TABLE "constraint" (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE,
	category_id TEXT NOT NULL CHECK (
		category_id IN ('BUSINESS', 'PHYSICS', 'ENGINEERING')
	) DEFAULT ('BUSINESS')
);

CREATE TABLE effect (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE environment_component (
    id UUID PRIMARY KEY
        REFERENCES component (id)
        ON DELETE CASCADE
);

CREATE TABLE example (
    id UUID PRIMARY KEY
        REFERENCES behavior (id)
        ON DELETE CASCADE
);

CREATE TABLE functionality (
    id UUID PRIMARY KEY
        REFERENCES behavior (id)
        ON DELETE CASCADE
);

CREATE TABLE functional_behavior (
    id UUID PRIMARY KEY
        REFERENCES functionality (id)
        ON DELETE CASCADE
);

CREATE TABLE glossary_term (
    id UUID PRIMARY KEY
            REFERENCES component (id)
            ON DELETE CASCADE
);

CREATE TABLE goal (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE noise (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE hint (
    id UUID PRIMARY KEY
            REFERENCES noise (id)
            ON DELETE CASCADE
);

CREATE TABLE invariant (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE meta_requirement (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE justification (
    id UUID PRIMARY KEY
            REFERENCES meta_requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE "limit" (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE non_functional_behavior (
    id UUID PRIMARY KEY
            REFERENCES functionality (id)
            ON DELETE CASCADE
);

CREATE TABLE obstacle (
    id UUID PRIMARY KEY
            REFERENCES goal (id)
            ON DELETE CASCADE
);

CREATE TABLE outcome (
    id UUID PRIMARY KEY
            REFERENCES goal (id)
            ON DELETE CASCADE
);

CREATE TABLE responsibility (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE role (
    id UUID PRIMARY KEY
            REFERENCES responsibility (id)
            ON DELETE CASCADE
);

CREATE TABLE person (
    id UUID PRIMARY KEY
        REFERENCES actor (id)
        ON DELETE CASCADE,
    email TEXT NOT NULL
);

CREATE TABLE product (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE scenario (
    id UUID PRIMARY KEY
            REFERENCES example (id)
            ON DELETE CASCADE,
    primary_actor_id UUID REFERENCES actor (id)
                 ON DELETE RESTRICT
);

CREATE TABLE silence (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE stakeholder (
    id UUID PRIMARY KEY
            REFERENCES component (id)
            ON DELETE CASCADE,
	segmentation_id TEXT NOT NULL
            CHECK (segmentation_id IN ('CLIENT', 'VENDOR')) DEFAULT ('CLIENT'),
	category_id TEXT NOT NULL CHECK (
		category_id IN (
			'KEY_STAKEHOLDER',
			'SHADOW_INFLUENCER',
			'FELLOW_TRAVELER',
			'OBSERVER'
		)
	) DEFAULT ('KEY_STAKEHOLDER'),
	influence INTEGER NOT NULL CHECK (
		influence >= 0
		AND influence <= 100
	),
	availability INTEGER NOT NULL CHECK (
		availability >= 0
		AND availability <= 100
	)
);

CREATE TABLE system_component (
    id UUID PRIMARY KEY
            REFERENCES component (id)
            ON DELETE CASCADE
);

CREATE TABLE task (
    id UUID PRIMARY KEY
            REFERENCES requirement (id)
            ON DELETE CASCADE
);

CREATE TABLE test_case (
    id UUID PRIMARY KEY
            REFERENCES example (id)
            ON DELETE CASCADE
);

CREATE TABLE use_case (
    id UUID PRIMARY KEY
            REFERENCES scenario (id)
            ON DELETE CASCADE,
	scope TEXT NOT NULL,
	level TEXT NOT NULL,
	goal_in_context TEXT NOT NULL,
	precondition_id UUID REFERENCES assumption (id)
                ON DELETE RESTRICT
                NOT NULL,
	trigger_id UUID NOT NULL,
	main_success_scenario TEXT NOT NULL,
	success_guarantee_id UUID REFERENCES effect (id)
                 ON DELETE RESTRICT
                 NOT NULL,
	extensions TEXT NOT NULL
);

CREATE TABLE user_story (
    id UUID PRIMARY KEY
            REFERENCES scenario (id)
            ON DELETE CASCADE,
	outcome_id UUID NOT NULL
            REFERENCES outcome (id)
            ON DELETE RESTRICT,
	functional_behavior_id UUID NOT NULL
            REFERENCES functionality (id)
            ON DELETE RESTRICT
);

COMMIT;