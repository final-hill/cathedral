import { Migration } from '@mikro-orm/migrations'

export class Migration20250929000000 extends Migration {
    override async up(): Promise<void> {
        // Clean up existing Person requirements that were created before the endorsement system
        // was properly established. This ensures consistency with the new endorsement-aware system.

        // First, identify Person requirements that were NOT created by the previous migration
        // (i.e., existing Person requirements that don't follow the new system)
        this.addSql(`
            -- Delete existing Person requirement versions that are not the "Solution Creator" 
            -- entities created by Migration20250926184237
            DELETE FROM requirement_versions 
            WHERE req_type = 'person' 
              AND NOT (
                name = 'Solution Creator' 
                AND description = 'Initial person for solution administration'
              )
              AND NOT is_deleted;
        `)

        // Clean up any orphaned requirement static records
        this.addSql(`
            DELETE FROM requirement 
            WHERE req_type = 'person'
              AND id NOT IN (
                SELECT DISTINCT requirement_id 
                FROM requirement_versions 
                WHERE NOT is_deleted
              );
        `)

        // Also clean up any endorsements that might reference the deleted Person requirements
        this.addSql(`
            DELETE FROM endorsement 
            WHERE requirement_id NOT IN (
                SELECT DISTINCT requirement_id 
                FROM requirement_versions 
                WHERE NOT is_deleted
            );
        `)
    }

    override async down(): Promise<void> {
        // This migration cannot be easily rolled back since we're deleting data
        // If rollback is needed, the Person requirements would need to be recreated
        // manually or from a backup

        // Log a warning that this migration cannot be safely rolled back
        this.addSql(`
            -- WARNING: This migration deleted existing Person requirements
            -- Rolling back would require manual recreation of the deleted data
            -- No automatic rollback is provided for data safety
            SELECT 'Migration20250929000000 rollback: Person requirements were deleted and cannot be automatically restored' as warning;
        `)
    }
}
