import type { PGliteInterface } from "@electric-sql/pglite";
import Migration from "../Migration";

export default class BehaviorPriority_00003 extends Migration {
    override async up(db: PGliteInterface): Promise<void> {
        const sql = `
            ALTER TABLE cathedral.behavior
            ADD COLUMN priority_id VARCHAR(6);
        `

        await db.exec(sql)
    }

    override async down(db: PGliteInterface): Promise<void> {
        const sql = `
            ALTER TABLE cathedral.behavior
            DROP COLUMN priority_id;
        `

        await db.exec(sql)
    }
}