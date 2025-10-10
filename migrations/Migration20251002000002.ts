import { Migration } from '@mikro-orm/migrations'

export class Migration20251002000002 extends Migration {
    override async up(): Promise<void> {
        // Fix the duplicates created by Migration20251002000001
        // The previous migration had flawed JOIN logic that created duplicate entities

        console.log('Fixing duplicates created by previous migration...')

        // Step 1: Delete duplicate Product Owner roles (keep only one per solution)
        this.addSql(`
            -- Delete duplicate Product Owner roles, keeping the one with earliest effective_from per solution
            DELETE FROM requirement_versions rv1
            WHERE rv1.req_type = 'role'
              AND rv1.name = 'Product Owner'
              AND rv1.effective_from >= '2025-10-02 17:00:00'  -- Only recently created ones
              AND EXISTS (
                  SELECT 1 FROM requirement_versions rv2
                  WHERE rv2.req_type = 'role'
                    AND rv2.name = 'Product Owner'
                    AND rv2.solution_id = rv1.solution_id
                    AND rv2.effective_from < rv1.effective_from
                    AND rv2.effective_from >= '2025-10-02 17:00:00'
              );
        `)

        // Step 2: Delete duplicate Implementation Owner roles (keep only one per solution)
        this.addSql(`
            -- Delete duplicate Implementation Owner roles, keeping the one with earliest effective_from per solution
            DELETE FROM requirement_versions rv1
            WHERE rv1.req_type = 'role'
              AND rv1.name = 'Implementation Owner'
              AND rv1.effective_from >= '2025-10-02 17:00:00'  -- Only recently created ones
              AND EXISTS (
                  SELECT 1 FROM requirement_versions rv2
                  WHERE rv2.req_type = 'role'
                    AND rv2.name = 'Implementation Owner'
                    AND rv2.solution_id = rv1.solution_id
                    AND rv2.effective_from < rv1.effective_from
                    AND rv2.effective_from >= '2025-10-02 17:00:00'
              );
        `)

        // Step 3: Delete duplicate Solution Creator persons (keep only one per solution)
        this.addSql(`
            -- Delete duplicate Solution Creator persons, keeping the one with earliest effective_from per solution
            DELETE FROM requirement_versions rv1
            WHERE rv1.req_type = 'person'
              AND rv1.name = 'Solution Creator'
              AND rv1.effective_from >= '2025-10-02 17:00:00'  -- Only recently created ones
              AND EXISTS (
                  SELECT 1 FROM requirement_versions rv2
                  WHERE rv2.req_type = 'person'
                    AND rv2.name = 'Solution Creator'
                    AND rv2.solution_id = rv1.solution_id
                    AND rv2.effective_from < rv1.effective_from
                    AND rv2.effective_from >= '2025-10-02 17:00:00'
              );
        `)

        // Step 4: Clean up orphaned requirement records that no longer have versions
        this.addSql(`
            -- Delete orphaned requirement records
            DELETE FROM requirement r
            WHERE r.req_type IN ('role', 'person')
              AND r.creation_date >= '2025-10-02 17:00:00'  -- Only recently created ones
              AND NOT EXISTS (
                  SELECT 1 FROM requirement_versions rv
                  WHERE rv.requirement_id = r.id
                    AND NOT rv.is_deleted
              );
        `)

        console.log('Completed cleanup of duplicate entities.')
    }

    override async down(): Promise<void> {
        // This migration fixes data created by the previous migration
        // Rolling back would restore the duplicates, which is not desirable
        this.addSql(`
            SELECT 'Migration20251002000002 rollback: This cleanup migration should not be rolled back' as warning;
        `)
    }
}
