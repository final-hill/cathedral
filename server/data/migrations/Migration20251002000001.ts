import { Migration } from '@mikro-orm/migrations'

export class Migration20251002000001 extends Migration {
    override async up(): Promise<void> {
        // Complete fix for duplicate requirement IDs by recreating all mandatory roles properly
        // This ensures each solution has unique Product Owner and Implementation Owner roles
        // regardless of the current database state

        console.log('Starting complete recreation of mandatory roles for all solutions...')

        // Step 1: Store endorsements that reference the roles we're about to delete
        this.addSql(`
            CREATE TEMPORARY TABLE temp_role_endorsements AS
            SELECT 
                e.id as endorsement_id,
                e.requirement_id,
                e.role_id,
                rv_role.name as role_name,
                rv_role.solution_id,
                e.status,
                e.endorsed_at,
                e.rejected_at,
                e.comments,
                e.endorsed_by_id
            FROM endorsement e
            JOIN requirement_versions rv_role ON e.role_id = rv_role.requirement_id
            WHERE rv_role.req_type = 'role'
              AND rv_role.name IN ('Product Owner', 'Implementation Owner')
              AND NOT rv_role.is_deleted;
        `)

        // Step 2: Delete all existing Product Owner and Implementation Owner roles
        this.addSql(`
            -- Delete endorsements that reference these roles
            DELETE FROM endorsement 
            WHERE role_id IN (
                SELECT requirement_id 
                FROM requirement_versions 
                WHERE req_type = 'role' 
                  AND name IN ('Product Owner', 'Implementation Owner')
                  AND NOT is_deleted
            );
        `)

        this.addSql(`
            -- Delete the role requirement_versions
            DELETE FROM requirement_versions 
            WHERE req_type = 'role' 
              AND name IN ('Product Owner', 'Implementation Owner')
              AND NOT is_deleted;
        `)

        this.addSql(`
            -- Clean up orphaned requirement records
            DELETE FROM requirement 
            WHERE req_type = 'role'
              AND id NOT IN (
                  SELECT DISTINCT requirement_id 
                  FROM requirement_versions 
                  WHERE NOT is_deleted
              );
        `)

        // Step 3: For each solution, create new unique Product Owner and Implementation Owner roles
        this.addSql(`
            -- Create Product Owner roles (one per solution)
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + (ROW_NUMBER() OVER(ORDER BY rv.requirement_id) || ' microseconds')::interval),
                rv.modified_by_id,
                NOW(),
                'role'
            FROM requirement_versions rv
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted;
        `)

        this.addSql(`
            -- Create Product Owner requirement_versions
            INSERT INTO requirement_versions (
                requirement_id, effective_from, solution_id, req_type, name, description,
                is_product_owner, can_endorse_project_requirements,
                can_endorse_environment_requirements, can_endorse_goals_requirements,
                can_endorse_system_requirements,
                modified_by_id, is_deleted, workflow_state
            )
            SELECT 
                r.id,
                NOW() + (ROW_NUMBER() OVER(ORDER BY rv.requirement_id) || ' microseconds')::interval,
                rv.requirement_id,
                'role',
                'Product Owner',
                'Responsible for defining and prioritizing requirements',
                true,
                true,
                true,
                true,
                true,
                rv.modified_by_id,
                false,
                'Active'
            FROM requirement_versions rv
            JOIN requirement r ON r.created_by_id = rv.modified_by_id 
                AND r.req_type = 'role'
                AND r.creation_date >= NOW() - interval '1 minute'
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted
              AND NOT EXISTS (
                  SELECT 1 FROM requirement_versions rv2 
                  WHERE rv2.requirement_id = r.id
              );
        `)

        this.addSql(`
            -- Create Implementation Owner roles (one per solution)
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + ((ROW_NUMBER() OVER(ORDER BY rv.requirement_id) + 1000) || ' microseconds')::interval),
                rv.modified_by_id,
                NOW(),
                'role'
            FROM requirement_versions rv
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted;
        `)

        this.addSql(`
            -- Create Implementation Owner requirement_versions
            INSERT INTO requirement_versions (
                requirement_id, effective_from, solution_id, req_type, name, description,
                is_implementation_owner, can_endorse_project_requirements,
                can_endorse_environment_requirements, can_endorse_goals_requirements,
                can_endorse_system_requirements,
                modified_by_id, is_deleted, workflow_state
            )
            SELECT 
                r.id,
                NOW() + ((ROW_NUMBER() OVER(ORDER BY rv.requirement_id) + 1000) || ' microseconds')::interval,
                rv.requirement_id,
                'role',
                'Implementation Owner',
                'Responsible for technical implementation and system design',
                true,
                true,
                true,
                true,
                true,
                rv.modified_by_id,
                false,
                'Active'
            FROM requirement_versions rv
            JOIN requirement r ON r.created_by_id = rv.modified_by_id 
                AND r.req_type = 'role'
                AND r.creation_date >= NOW() - interval '1 minute'
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted
              AND NOT EXISTS (
                  SELECT 1 FROM requirement_versions rv2 
                  WHERE rv2.requirement_id = r.id
              )
              AND NOT EXISTS (
                  SELECT 1 FROM requirement_versions rv3
                  WHERE rv3.solution_id = rv.requirement_id
                    AND rv3.req_type = 'role'
                    AND rv3.name = 'Product Owner'
                    AND rv3.requirement_id = r.id
              );
        `)

        // Step 4: Create Solution Creator Person for each solution
        this.addSql(`
            -- Create Solution Creator Person entities (one per solution)
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + ((ROW_NUMBER() OVER(ORDER BY rv.requirement_id) + 2000) || ' microseconds')::interval),
                rv.modified_by_id,
                NOW(),
                'person'
            FROM requirement_versions rv
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted;
        `)

        this.addSql(`
            -- Create Solution Creator Person requirement_versions
            -- Note: Role assignments are handled through references in the domain layer
            INSERT INTO requirement_versions (
                requirement_id, effective_from, solution_id, req_type, name, description,
                app_user_id, modified_by_id, is_deleted, workflow_state
            )
            SELECT 
                r.id,
                NOW() + ((ROW_NUMBER() OVER(ORDER BY rv.requirement_id) + 2000) || ' microseconds')::interval,
                rv.requirement_id,
                'person',
                'Solution Creator',
                'Initial person for solution administration',
                rv.modified_by_id,  -- Link to the solution creator's AppUser
                rv.modified_by_id,
                false,
                'Active'
            FROM requirement_versions rv
            JOIN requirement r ON r.created_by_id = rv.modified_by_id 
                AND r.req_type = 'person'
                AND r.creation_date >= NOW() - interval '1 minute'
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted
              AND NOT EXISTS (
                  SELECT 1 FROM requirement_versions rv2 
                  WHERE rv2.requirement_id = r.id
              );
        `)

        // Step 5: Recreate endorsements with the new role IDs
        this.addSql(`
            -- Recreate endorsements using the new role IDs
            INSERT INTO endorsement (
                id, requirement_id, role_id, status, endorsed_at, rejected_at, 
                comments, endorsed_by_id
            )
            SELECT 
                tre.endorsement_id,
                tre.requirement_id,
                rv_new.requirement_id,  -- New role ID
                tre.status,
                tre.endorsed_at,
                tre.rejected_at,
                tre.comments,
                tre.endorsed_by_id
            FROM temp_role_endorsements tre
            JOIN requirement_versions rv_new ON rv_new.solution_id = tre.solution_id
                AND rv_new.req_type = 'role'
                AND rv_new.name = tre.role_name
                AND NOT rv_new.is_deleted
            WHERE rv_new.effective_from >= NOW() - interval '1 minute';  -- Only new roles
        `)

        // Step 6: Clean up temporary table
        this.addSql(`DROP TABLE temp_role_endorsements;`)

        console.log('Completed recreation of all mandatory roles with unique IDs per solution.')
    }

    override async down(): Promise<void> {
        // This migration fixes fundamental data integrity issues and should not be rolled back
        // Rolling back would recreate the duplicate requirement ID problem
        this.addSql(`
            SELECT 'Migration20251002000001 rollback: This migration fixes data integrity and should not be rolled back' as warning;
        `)
    }
}
