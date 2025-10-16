import { Migration } from '@mikro-orm/migrations'

export class Migration20251002000003 extends Migration {
    override async up(): Promise<void> {
        // Final fix for the remaining duplicates - create new requirement IDs for FH Local Test Solution
        // Keep the original IDs for dummy-local-org-123 (older solution)

        console.log('Creating new requirement IDs for FH Local Test Solution to eliminate remaining duplicates...')

        // Step 1: Create new requirement records for duplicated entities in FH Local Test Solution
        this.addSql(`
            -- Create new requirement records for Product Owner in FH Local Test Solution
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + '1 microsecond'::interval),
                rv.modified_by_id,
                NOW(),
                'role'
            FROM requirement_versions rv
            WHERE rv.requirement_id = '0199a5e0-23f9-7d02-9f7a-7ce91fbba342'
              AND rv.solution_id = '0198731c-7bb1-7732-b6f9-6b101aca5480'  -- FH Local Test Solution
              AND rv.req_type = 'role'
              AND rv.name = 'Product Owner'
            LIMIT 1;
        `)

        this.addSql(`
            -- Create new requirement records for Implementation Owner in FH Local Test Solution
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + '2 microseconds'::interval),
                rv.modified_by_id,
                NOW(),
                'role'
            FROM requirement_versions rv
            WHERE rv.requirement_id = '0199a5e0-23fa-7d06-a5b9-79a97df6c66e'
              AND rv.solution_id = '0198731c-7bb1-7732-b6f9-6b101aca5480'  -- FH Local Test Solution
              AND rv.req_type = 'role'
              AND rv.name = 'Implementation Owner'
            LIMIT 1;
        `)

        this.addSql(`
            -- Create new requirement records for Solution Creator in FH Local Test Solution
            INSERT INTO requirement (id, created_by_id, creation_date, req_type)
            SELECT 
                uuid7(NOW() + '3 microseconds'::interval),
                rv.modified_by_id,
                NOW(),
                'person'
            FROM requirement_versions rv
            WHERE rv.requirement_id = '0199a5e0-23fb-7d06-8250-c2ad5455e20e'
              AND rv.solution_id = '0198731c-7bb1-7732-b6f9-6b101aca5480'  -- FH Local Test Solution
              AND rv.req_type = 'person'
              AND rv.name = 'Solution Creator'
            LIMIT 1;
        `)

        // Step 2: Update the requirement_versions to use the new requirement IDs for FH Local Test Solution
        this.addSql(`
            -- Update Product Owner in FH Local Test Solution to use new requirement ID
            UPDATE requirement_versions 
            SET requirement_id = (
                SELECT id FROM requirement 
                WHERE req_type = 'role' 
                  AND creation_date >= NOW() - interval '1 minute'
                  AND id != '0199a5e0-23f9-7d02-9f7a-7ce91fbba342'
                ORDER BY creation_date ASC
                LIMIT 1
            )
            WHERE requirement_id = '0199a5e0-23f9-7d02-9f7a-7ce91fbba342'
              AND solution_id = '0198731c-7bb1-7732-b6f9-6b101aca5480'  -- FH Local Test Solution
              AND req_type = 'role'
              AND name = 'Product Owner';
        `)

        this.addSql(`
            -- Update Implementation Owner in FH Local Test Solution to use new requirement ID
            UPDATE requirement_versions 
            SET requirement_id = (
                SELECT id FROM requirement 
                WHERE req_type = 'role' 
                  AND creation_date >= NOW() - interval '1 minute'
                  AND id != '0199a5e0-23fa-7d06-a5b9-79a97df6c66e'
                ORDER BY creation_date ASC
                LIMIT 1 OFFSET 1
            )
            WHERE requirement_id = '0199a5e0-23fa-7d06-a5b9-79a97df6c66e'
              AND solution_id = '0198731c-7bb1-7732-b6f9-6b101aca5480'  -- FH Local Test Solution
              AND req_type = 'role'
              AND name = 'Implementation Owner';
        `)

        this.addSql(`
            -- Update Solution Creator in FH Local Test Solution to use new requirement ID
            UPDATE requirement_versions 
            SET requirement_id = (
                SELECT id FROM requirement 
                WHERE req_type = 'person' 
                  AND creation_date >= NOW() - interval '1 minute'
                  AND id != '0199a5e0-23fb-7d06-8250-c2ad5455e20e'
                ORDER BY creation_date ASC
                LIMIT 1
            )
            WHERE requirement_id = '0199a5e0-23fb-7d06-8250-c2ad5455e20e'
              AND solution_id = '0198731c-7bb1-7732-b6f9-6b101aca5480'  -- FH Local Test Solution
              AND req_type = 'person'
              AND name = 'Solution Creator';
        `)

        console.log('Completed creation of unique requirement IDs for all solutions.')
    }

    override async down(): Promise<void> {
        // This migration creates new requirement IDs which can't be easily rolled back
        this.addSql(`
            SELECT 'Migration20251002000003 rollback: Creating new requirement IDs cannot be easily rolled back' as warning;
        `)
    }
}
