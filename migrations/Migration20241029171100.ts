import { Migration } from '@mikro-orm/migrations'

export class Migration20241029171100 extends Migration {
    override async up(): Promise<void> {
        // There is currently a record { req_type: 'justification', name: 'Situation', ...} in the requirement table
        // Update the req_type to 'obstacle' and the name to 'G.2'
        this.addSql(`
            UPDATE requirement
            SET req_type = 'obstacle', name = 'G.2'
            WHERE req_type = 'justification' AND name = 'Situation';
        `)

        // There are currently records in the requirement table with req_type = 'justification' and name in name in ('Vision', 'Mission', 'Objective')
        // Update the req_type of the 'Vision' record to 'goal' and the name to 'G.1'
        // Update the description field of the 'Vision' record to '# Vision\n\n${description1}\n\n# Mission\n\n${description2}\n\n# Objective\n\n${description3}'
        // Where description1, description2, and description3 are the descriptions of the 'Vision', 'Mission', and 'Objective' records respectively
        this.addSql(`
            WITH description1 AS (
                SELECT description
                FROM requirement
                WHERE req_type = 'justification' AND name = 'Vision'
            ),
            description2 AS (
                SELECT description
                FROM requirement
                WHERE req_type = 'justification' AND name = 'Mission'
            ),
            description3 AS (
                SELECT description
                FROM requirement
                WHERE req_type = 'justification' AND name = 'Objective'
            )
            UPDATE requirement
            SET req_type = 'goal', name = 'G.1', description = E'# Vision\n\n' || (SELECT description FROM description1) || E'\n\n# Mission\n\n' || (SELECT description FROM description2) || E'\n\n# Objective\n\n' || (SELECT description FROM description3)
            WHERE req_type = 'justification' AND name = 'Vision';
        `)

        // delete the Mission and Objective records from the requirement table
        this.addSql(`
            DELETE FROM requirement
            WHERE req_type = 'justification' AND name IN ('Mission', 'Objective');
        `)
    }

    override async down(): Promise<void> { }
}
