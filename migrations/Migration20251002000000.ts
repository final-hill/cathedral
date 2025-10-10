import { Migration } from '@mikro-orm/migrations'

export class Migration20251002000000 extends Migration {
    override async up(): Promise<void> {
        // Fix duplicate requirement IDs across solutions
        // The issue: Migration20250926184237 incorrectly reused the same requirement IDs
        // for Product Owner and Implementation Owner roles across multiple solutions

        // Strategy: Keep the roles in the oldest solution with original IDs,
        // create new unique IDs for roles in newer solutions

        console.log('Starting fix for duplicate requirement IDs across solutions...')

        // Step 1: Identify the solutions and their creation order
        // We'll keep the original IDs for the oldest solution
        this.addSql(`
            CREATE TEMPORARY TABLE temp_solution_order AS
            SELECT 
                rv.requirement_id as solution_id,
                rv.name as solution_name,
                rv.effective_from,
                ROW_NUMBER() OVER (ORDER BY rv.effective_from ASC) as solution_rank
            FROM requirement_versions rv
            WHERE rv.req_type = 'solution' 
              AND NOT rv.is_deleted
            ORDER BY rv.effective_from ASC;
        `)

        // Step 2: For each duplicate role, create new requirement IDs for solutions other than the first one

        // Handle Product Owner roles
        this.addSql(`
            -- Create new requirement records for Product Owner roles in non-first solutions
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + (ROW_NUMBER() OVER() || ' microseconds')::interval) as new_id,
                rv.modified_by_id,
                NOW(),
                'role'
            FROM requirement_versions rv
            JOIN temp_solution_order tso ON rv.solution_id = tso.solution_id
            WHERE rv.req_type = 'role'
              AND rv.name = 'Product Owner'
              AND rv.requirement_id = '01999250-5e92-7620-b29d-f143b367365f'
              AND tso.solution_rank > 1  -- Not the first/oldest solution
              AND NOT rv.is_deleted;
        `)

        this.addSql(`
            -- Update Product Owner requirement_versions to use new IDs for non-first solutions
            UPDATE requirement_versions rv
            SET requirement_id = (
                SELECT r.id 
                FROM requirement r
                WHERE r.created_by_id = rv.modified_by_id
                  AND r.req_type = 'role'
                  AND r.creation_date >= NOW() - interval '1 minute'  -- Just created
                  AND r.id != '01999250-5e92-7620-b29d-f143b367365f'  -- Not the original
                LIMIT 1
            )
            FROM temp_solution_order tso
            WHERE rv.solution_id = tso.solution_id
              AND rv.req_type = 'role'
              AND rv.name = 'Product Owner'
              AND rv.requirement_id = '01999250-5e92-7620-b29d-f143b367365f'
              AND tso.solution_rank > 1
              AND NOT rv.is_deleted;
        `)

        // Handle Implementation Owner roles
        this.addSql(`
            -- Create new requirement records for Implementation Owner roles in non-first solutions
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + (ROW_NUMBER() OVER() + 1000 || ' microseconds')::interval) as new_id,
                rv.modified_by_id,
                NOW(),
                'role'
            FROM requirement_versions rv
            JOIN temp_solution_order tso ON rv.solution_id = tso.solution_id
            WHERE rv.req_type = 'role'
              AND rv.name = 'Implementation Owner'
              AND rv.requirement_id = '01999250-5e92-7624-a70d-95d077763860'
              AND tso.solution_rank > 1  -- Not the first/oldest solution
              AND NOT rv.is_deleted;
        `)

        this.addSql(`
            -- Update Implementation Owner requirement_versions to use new IDs for non-first solutions
            UPDATE requirement_versions rv
            SET requirement_id = (
                SELECT r.id 
                FROM requirement r
                WHERE r.created_by_id = rv.modified_by_id
                  AND r.req_type = 'role'
                  AND r.creation_date >= NOW() - interval '1 minute'  -- Just created
                  AND r.id != '01999250-5e92-7624-a70d-95d077763860'  -- Not the original
                LIMIT 1 OFFSET (
                    SELECT COUNT(*) 
                    FROM requirement r2 
                    WHERE r2.created_by_id = rv.modified_by_id
                      AND r2.req_type = 'role'
                      AND r2.creation_date >= NOW() - interval '1 minute'
                      AND r2.id != '01999250-5e92-7620-b29d-f143b367365f'  -- Not Product Owner
                      AND r2.id != '01999250-5e92-7624-a70d-95d077763860'  -- Not original Implementation Owner
                ) - 1
            )
            FROM temp_solution_order tso
            WHERE rv.solution_id = tso.solution_id
              AND rv.req_type = 'role'
              AND rv.name = 'Implementation Owner'
              AND rv.requirement_id = '01999250-5e92-7624-a70d-95d077763860'
              AND tso.solution_rank > 1
              AND NOT rv.is_deleted;
        `)

        // Step 3: Update any endorsements that might reference the old role IDs
        // Note: Endorsements reference role_id, so we need to update those too
        this.addSql(`
            -- Update endorsements to reference the new role IDs where applicable
            -- This is a complex update since we need to match by solution context
            UPDATE endorsement e
            SET role_id = rv_new.requirement_id
            FROM requirement_versions rv_req,  -- The requirement being endorsed
                 requirement_versions rv_new   -- The new role requirement
            WHERE e.requirement_id = rv_req.requirement_id
              AND rv_new.solution_id = rv_req.solution_id  -- Same solution
              AND rv_new.req_type = 'role'
              AND rv_new.name IN ('Product Owner', 'Implementation Owner')
              AND e.role_id IN (
                  '01999250-5e92-7620-b29d-f143b367365f',   -- Original Product Owner ID
                  '01999250-5e92-7624-a70d-95d077763860'    -- Original Implementation Owner ID
              )
              AND rv_new.requirement_id != e.role_id  -- Only update if it's a different ID
              AND NOT rv_req.is_deleted
              AND NOT rv_new.is_deleted;
        `)

        // Step 4: Clean up temporary table
        this.addSql(`DROP TABLE temp_solution_order;`)

        console.log('Completed fix for duplicate requirement IDs across solutions.')
    }

    override async down(): Promise<void> {
        // Rolling back this migration is complex and potentially data-destructive
        // since we're changing requirement IDs that might be referenced elsewhere

        // For safety, we'll just log a warning rather than attempting automatic rollback
        this.addSql(`
            -- WARNING: Rolling back Migration20241002000000 is not automatically supported
            -- This migration fixed duplicate requirement IDs across solutions
            -- Manual intervention would be required to safely roll back these changes
            -- as it involves changing primary keys and foreign key references
            SELECT 'Migration20241002000000 rollback: Automatic rollback not supported for requirement ID changes' as warning;
        `)

        // If rollback is absolutely necessary, it would require:
        // 1. Identifying which requirement IDs were changed
        // 2. Updating all references back to the original IDs
        // 3. Deleting the newly created requirement records
        // 4. This is complex and error-prone, so manual intervention is recommended
    }
}
