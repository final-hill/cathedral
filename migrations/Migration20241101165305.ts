import { Migration } from '@mikro-orm/migrations'

export class Migration20241101165305 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        this.addSql(`alter table "requirement" drop column "goal_in_context";`)

        this.addSql(`alter table "requirement" add column "req_id" text null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        // change the justification requirements to outcome requirements
        this.addSql(`
            UPDATE requirement
            SET req_type = 'outcome'
            WHERE req_type = 'justification'
            AND name = 'G.1';
        `)

        // Temporary SQL function for generating req_id's based on the solution_id and prefix
        this.addSql(`
            CREATE OR REPLACE FUNCTION generate_req_id(solution_id UUID, prefix TEXT)
            RETURNS TEXT AS $$
            DECLARE
                max_suffix INTEGER;
                new_req_id TEXT;
            BEGIN
                -- Find the maximum numeric suffix for the given prefix within the specified solution
                SELECT COALESCE(MAX((substring(r.req_id from length(prefix) + 1 for 10))::INTEGER), 0)
                INTO max_suffix
                FROM requirement r
                JOIN requirement_relation rr ON rr.left_id = r.id
                WHERE r.req_id LIKE prefix || '%'
                AND rr.right_id = solution_id
                AND rr.rel_type = 'belongs'
                AND r.is_silence = false;

                -- Generate the new reqId by incrementing the suffix
                new_req_id := prefix || (max_suffix + 1)::TEXT;

                RETURN new_req_id;
            END;
            $$ LANGUAGE plpgsql;
        `)

        // Generate req_id's for existing requirements
        this.addSql(`
            DO $$
            DECLARE
                solution RECORD;
                req RECORD;
                reqIdPrefix TEXT;
                new_req_id TEXT;
            BEGIN
                -- Loop over each solution in the requirements table
                FOR solution IN
                    SELECT * FROM requirement WHERE req_type = 'solution'
                LOOP
                    -- For each solution, find all non-silence requirements that belong to it
                    FOR req IN
                        SELECT r.* FROM requirement r
                        JOIN requirement_relation rr ON rr.left_id = r.id
                        WHERE rr.right_id = solution.id
                        AND r.req_id IS NULL  -- Only generate for null req_id
                        AND r.is_silence = false -- Only generate for non-silence requirements
                        AND r.req_type in ('person', 'glossary_term', 'environment_component', 'constraint', 'assumption', 'effect', 'invariant', 'outcome', 'obstacle', 'epic', 'limit', 'stakeholder', 'system_component', 'functional_behavior', 'non_functional_behavior', 'use_case', 'user_story')
                    LOOP
                        -- Determine the prefix based on req_type
                        CASE req.req_type
                            WHEN 'person' THEN reqIdPrefix := 'P.1.';
                            WHEN 'glossary_term' THEN reqIdPrefix := 'E.1.';
                            WHEN 'environment_component' THEN reqIdPrefix := 'E.2.';
                            WHEN 'constraint' THEN reqIdPrefix := 'E.3.';
                            WHEN 'assumption' THEN reqIdPrefix := 'E.4.';
                            WHEN 'effect' THEN reqIdPrefix := 'E.5.';
                            WHEN 'invariant' THEN reqIdPrefix := 'E.6.';
                            WHEN 'obstacle' THEN reqIdPrefix := 'G.2.';
                            WHEN 'outcome' THEN reqIdPrefix := 'G.3.';
                            WHEN 'epic' THEN reqIdPrefix := 'G.5.';
                            WHEN 'limit' THEN reqIdPrefix := 'G.6.';
                            WHEN 'stakeholder' THEN reqIdPrefix := 'G.7.';
                            WHEN 'system_component' THEN reqIdPrefix := 'S.1.';
                            WHEN 'functional_behavior' THEN reqIdPrefix := 'S.2.';
                            WHEN 'non_functional_behavior' THEN reqIdPrefix := 'S.2.';
                            WHEN 'use_case' THEN reqIdPrefix := 'S.4.';
                            WHEN 'user_story' THEN reqIdPrefix := 'S.4.';
                        END CASE;

                        -- Generate new req_id using the prefix, passing the solution ID
                        new_req_id := generate_req_id(solution.id, reqIdPrefix);

                        -- Update the requirement with the new req_id
                        UPDATE requirement
                        SET req_id = new_req_id
                        WHERE id = req.id;
                    END LOOP;
                END LOOP;
            END $$;
        `)

        // delete the generate_req_id function
        this.addSql(`DROP FUNCTION generate_req_id(UUID, TEXT);`)

        // Set the current Goal situation Obstacle to the new req_id G.2.0
        this.addSql(`
            UPDATE requirement
            SET req_id = 'G.2.0'
            WHERE req_type = 'obstacle'
            AND name = 'G.2';
        `)

        // Change the 'G.1' goal to req_type = 'outcome',
        // Set its req_id to 'G.1.0'
        this.addSql(`
            UPDATE requirement
            SET req_type = 'outcome', req_id = 'G.1.0'
            WHERE req_type = 'goal'
            AND name = 'G.1';
        `)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)

        // Change the 'G.1.0' outcome to req_type = 'goal'
        this.addSql(`
            UPDATE requirement
            SET req_type = 'goal'
            WHERE req_type = 'outcome'
            AND req_id = 'G.1.0';
        `)

        this.addSql(`alter table "requirement" drop column "req_id";`)

        this.addSql(`alter table "requirement" add column "goal_in_context" varchar(255) null;`)
        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'effect', 'environment_component', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'hint', 'invariant', 'justification', 'limit', 'meta_requirement', 'noise', 'non_functional_behavior', 'obstacle', 'organization', 'outcome', 'parsed_requirement', 'person', 'product', 'requirement', 'responsibility', 'role', 'scenario', 'silence', 'solution', 'stakeholder', 'system_component', 'task', 'test_case', 'use_case', 'user_story'));`)

        // change the outcome requirements to justification requirements
        this.addSql(`
                UPDATE requirement
                SET req_type = 'justification'
                WHERE req_type = 'outcome'
                AND name = 'G.1';
            `)
    }
}
