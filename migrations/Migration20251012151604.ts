import { Migration } from '@mikro-orm/migrations'

export class Migration20251012151604 extends Migration {
    override async up(): Promise<void> {
        // Step 1: Update constraint checks to include new requirement types
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'functionality_overview', 'glossary_term', 'goal', 'goals', 'hint', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'functionality_overview', 'glossary_term', 'goal', 'goals', 'hint', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)

        // Step 2: Convert existing 'functionality' records to 'functionality_overview'
        // Note: 'functionality' is now an abstract parent type, while 'functionality_overview' is the concrete subtype
        this.addSql(`
            -- Update existing functionality requirements to functionality_overview
            UPDATE "requirement"
            SET req_type = 'functionality_overview'
            WHERE req_type = 'functionality';
        `)

        this.addSql(`
            -- Update existing functionality versions to functionality_overview
            UPDATE "requirement_versions"
            SET req_type = 'functionality_overview'
            WHERE req_type = 'functionality';
        `)

        // Step 3: Migrate existing Epics to reference FunctionalityOverview
        // Note: functionality_id column already exists from initial migration
        // 3.1: Create FunctionalityOverview entities ONLY if they don't already exist with matching name
        this.addSql(`
            -- Insert new FunctionalityOverview requirements only for FunctionalBehaviors 
            -- where no FunctionalityOverview with the same name and solution exists
            INSERT INTO "requirement" (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW()) as id,
                fb_req.created_by_id,
                NOW() as creation_date,
                'functionality_overview' as req_type
            FROM (
                -- Get unique FunctionalBehaviors referenced by ANY Epic (Active, Proposed, etc.)
                SELECT DISTINCT 
                    fb_req.id as fb_id,
                    fb_req.created_by_id,
                    fb_v.name as fb_name,
                    fb_v.solution_id
                FROM "requirement_versions" epic_v
                JOIN "requirement" fb_req ON fb_req.id = epic_v.functional_behavior_id
                JOIN "requirement_versions" fb_v ON fb_v.requirement_id = fb_req.id
                    AND fb_v.is_deleted = false
                    AND fb_v.effective_from <= NOW()
                    AND NOT EXISTS (
                        SELECT 1 FROM "requirement_versions" later_fb
                        WHERE later_fb.requirement_id = fb_v.requirement_id
                          AND later_fb.effective_from > fb_v.effective_from
                          AND later_fb.effective_from <= NOW()
                          AND later_fb.is_deleted = false
                    )
                WHERE epic_v.req_type = 'epic'
                  AND epic_v.is_deleted = false
                  AND epic_v.functional_behavior_id IS NOT NULL
                  AND epic_v.effective_from <= NOW()
                  AND NOT EXISTS (
                      SELECT 1 FROM "requirement_versions" later_epic
                      WHERE later_epic.requirement_id = epic_v.requirement_id
                        AND later_epic.effective_from > epic_v.effective_from
                        AND later_epic.effective_from <= NOW()
                  )
                  -- Don't create if FunctionalityOverview already exists with same name in same solution
                  AND NOT EXISTS (
                      SELECT 1 
                      FROM "requirement" fo_req
                      JOIN "requirement_versions" fo_v ON fo_v.requirement_id = fo_req.id
                      WHERE fo_req.req_type = 'functionality_overview'
                        AND fo_v.name = fb_v.name
                        AND fo_v.solution_id = fb_v.solution_id
                        AND fo_v.is_deleted = false
                  )
            ) fb_req;
        `)

        // 3.2: Create Proposed FunctionalityOverview versions ONLY for newly created entities
        this.addSql(`
            -- Insert Proposed FunctionalityOverview versions only for requirements that have no versions yet
            INSERT INTO "requirement_versions" (
                effective_from, requirement_id, is_deleted, modified_by_id,
                req_type, workflow_state, solution_id, name, description, req_id
            )
            SELECT 
                NOW() as effective_from,
                fo_req.id as requirement_id,
                false as is_deleted,
                fo_req.created_by_id as modified_by_id,
                'functionality_overview' as req_type,
                'Proposed' as workflow_state,
                fb_v.solution_id,
                fb_v.name,
                fb_v.description,
                NULL as req_id
            FROM "requirement" fo_req
            -- Match FunctionalityOverview created in step 2.1 by creation_date
            CROSS JOIN LATERAL (
                SELECT 
                    fb_v.solution_id,
                    fb_v.name,
                    fb_v.description
                FROM "requirement_versions" epic_v
                JOIN "requirement" fb_req ON fb_req.id = epic_v.functional_behavior_id
                JOIN "requirement_versions" fb_v ON fb_v.requirement_id = fb_req.id
                    AND fb_v.is_deleted = false
                    AND fb_v.effective_from <= NOW()
                    AND NOT EXISTS (
                        SELECT 1 FROM "requirement_versions" later_fb
                        WHERE later_fb.requirement_id = fb_v.requirement_id
                          AND later_fb.effective_from > fb_v.effective_from
                          AND later_fb.effective_from <= NOW()
                          AND later_fb.is_deleted = false
                    )
                WHERE epic_v.req_type = 'epic'
                  AND epic_v.is_deleted = false
                  AND epic_v.functional_behavior_id IS NOT NULL
                  AND fb_req.created_by_id = fo_req.created_by_id
                LIMIT 1
            ) fb_v
            WHERE fo_req.req_type = 'functionality_overview'
              -- Only create versions for FunctionalityOverview entities without any versions
              AND NOT EXISTS (
                  SELECT 1 FROM "requirement_versions" existing_fo_v
                  WHERE existing_fo_v.requirement_id = fo_req.id
              );
        `)

        // 3.3: Create new Proposed Epic versions referencing FunctionalityOverview (existing or newly created)
        this.addSql(`
            -- Insert new Proposed Epic versions that reference FunctionalityOverview matching the FB name
            -- This creates new versions for ALL Epics (Active, Proposed, etc.) that currently reference FunctionalBehavior
            INSERT INTO "requirement_versions" (
                effective_from, requirement_id, is_deleted, modified_by_id,
                req_type, workflow_state, solution_id, name, description, req_id,
                primary_actor_id, outcome_id, functionality_id
            )
            SELECT 
                NOW() + interval '1 second' as effective_from,
                epic_v.requirement_id,
                false as is_deleted,
                epic_v.modified_by_id,
                'epic' as req_type,
                'Proposed' as workflow_state,
                epic_v.solution_id,
                epic_v.name,
                epic_v.description,
                NULL as req_id,
                epic_v.primary_actor_id,
                epic_v.outcome_id,
                fo_req.id as functionality_id
            FROM (
                -- Get the latest Epic versions (any workflow state) that reference FunctionalBehavior
                SELECT DISTINCT ON (epic_v.requirement_id)
                    epic_v.*
                FROM "requirement_versions" epic_v
                WHERE epic_v.req_type = 'epic'
                  AND epic_v.is_deleted = false
                  AND epic_v.functional_behavior_id IS NOT NULL
                  AND epic_v.effective_from <= NOW()
                ORDER BY epic_v.requirement_id, epic_v.effective_from DESC
            ) epic_v
            -- Get the FunctionalBehavior being referenced (latest version regardless of workflow state)
            JOIN "requirement" fb_req ON fb_req.id = epic_v.functional_behavior_id
            JOIN "requirement_versions" fb_v ON fb_v.requirement_id = fb_req.id
                AND fb_v.is_deleted = false
                AND fb_v.effective_from <= NOW()
                AND NOT EXISTS (
                    SELECT 1 FROM "requirement_versions" later_fb
                    WHERE later_fb.requirement_id = fb_v.requirement_id
                      AND later_fb.effective_from > fb_v.effective_from
                      AND later_fb.effective_from <= NOW()
                      AND later_fb.is_deleted = false
                )
            -- Find FunctionalityOverview with matching name and solution (existing or newly created)
            JOIN "requirement_versions" fo_v ON fo_v.name = fb_v.name
                AND fo_v.solution_id = fb_v.solution_id
                AND fo_v.req_type = 'functionality_overview'
                AND fo_v.is_deleted = false
            JOIN "requirement" fo_req ON fo_req.id = fo_v.requirement_id;
        `)

        // Step 4: Rename functional_behavior_id column used by FunctionalBehavior/NonFunctionalBehavior to goal_functionality_id
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_functional_behavior_id_foreign";`)
        this.addSql(`alter table "requirement_versions" rename column "functional_behavior_id" to "goal_functionality_id";`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_goal_functionality_id_foreign" foreign key ("goal_functionality_id") references "requirement" ("id") on update cascade on delete set null;`)
    }

    override async down(): Promise<void> {
        // Rollback: Restore original structure

        // Step 1: Restore goal_functionality_id back to functional_behavior_id
        this.addSql(`alter table "requirement_versions" drop constraint "requirement_versions_goal_functionality_id_foreign";`)
        this.addSql(`alter table "requirement_versions" rename column "goal_functionality_id" to "functional_behavior_id";`)
        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_functional_behavior_id_foreign" foreign key ("functional_behavior_id") references "requirement" ("id") on update cascade on delete set null;`)

        // Step 2: Restore Epic functional_behavior_id references from Active versions using the FO relationship
        this.addSql(`
            -- Find the FunctionalBehavior that the FunctionalityOverview was based on and restore the reference
            UPDATE "requirement_versions" active_epic
            SET functional_behavior_id = fb_req.id
            FROM "requirement_versions" proposed_epic
            JOIN "requirement_versions" fo_v ON fo_v.requirement_id = proposed_epic.functionality_id
            JOIN "requirement_versions" fb_v ON fb_v.name = fo_v.name AND fb_v.req_type = 'functional_behavior'
            JOIN "requirement" fb_req ON fb_req.id = fb_v.requirement_id
            WHERE active_epic.requirement_id = proposed_epic.requirement_id
              AND active_epic.req_type = 'epic'
              AND active_epic.workflow_state = 'active'
              AND proposed_epic.req_type = 'epic'
              AND proposed_epic.workflow_state = 'proposed'
              AND proposed_epic.functionality_id IS NOT NULL
              AND proposed_epic.effective_from > active_epic.effective_from;
        `)

        // Step 3: Delete the Proposed Epic versions created by this migration
        this.addSql(`
            DELETE FROM "requirement_versions"
            WHERE req_type = 'epic'
              AND workflow_state = 'proposed'
              AND functionality_id IS NOT NULL;
        `)

        // Step 4: Delete the Proposed FunctionalityOverview versions created by this migration
        this.addSql(`
            DELETE FROM "requirement_versions"
            WHERE req_type = 'functionality_overview'
              AND workflow_state = 'proposed';
        `)

        // Step 5: Delete the FunctionalityOverview requirements created by this migration
        this.addSql(`
            DELETE FROM "requirement"
            WHERE req_type = 'functionality_overview'
              AND NOT EXISTS (
                  SELECT 1 FROM "requirement_versions"
                  WHERE requirement_id = "requirement".id
              );
        `)

        // Step 6: Restore 'functionality_overview' records back to 'functionality'
        // Only restore the ones that existed before this migration (not newly created ones)
        this.addSql(`
            -- Restore original functionality records (those not created by this migration)
            UPDATE "requirement_versions"
            SET req_type = 'functionality'
            WHERE req_type = 'functionality_overview'
              -- Only restore versions that existed before the migration
              AND effective_from < (
                  SELECT MIN(creation_date) 
                  FROM "requirement" 
                  WHERE req_type = 'functionality_overview'
                    AND NOT EXISTS (
                        SELECT 1 FROM "requirement_versions" rv
                        WHERE rv.requirement_id = "requirement".id
                          AND rv.workflow_state = 'Proposed'
                    )
              );
        `)

        this.addSql(`
            -- Restore original functionality requirement records
            UPDATE "requirement"
            SET req_type = 'functionality'
            WHERE req_type = 'functionality_overview'
              -- Only restore requirements that weren't created by this migration
              AND NOT EXISTS (
                  SELECT 1 FROM "requirement_versions" rv
                  WHERE rv.requirement_id = "requirement".id
                    AND rv.workflow_state = 'Proposed'
                    AND rv.req_type = 'functionality_overview'
              );
        `)

        // Step 7: Restore old constraint checks
        // Note: We don't drop functionality_id column as it existed before this migration
        this.addSql(`alter table "requirement" drop constraint if exists "requirement_req_type_check";`)
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_req_type_check";`)

        this.addSql(`alter table "requirement" add constraint "requirement_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_req_type_check" check("req_type" in ('actor', 'assumption', 'behavior', 'component', 'constraint', 'context_and_objective', 'effect', 'environment', 'environment_component', 'epic', 'example', 'functional_behavior', 'functionality', 'glossary_term', 'goal', 'goals', 'hint', 'interaction', 'interface', 'invariant', 'justification', 'limit', 'meta_requirement', 'milestone', 'noise', 'non_functional_behavior', 'obstacle', 'project', 'organization', 'outcome', 'parsed_requirements', 'person', 'product', 'requirement', 'responsibility', 'scenario', 'scenario_step', 'silence', 'solution', 'stakeholder', 'system', 'system_component', 'task', 'test_case', 'use_case', 'user_story', 'interface_operation', 'interface_input', 'interface_output', 'interface_schema', 'interface_flow'));`)
    }
}
