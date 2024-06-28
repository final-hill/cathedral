import type { PGliteInterface } from "@electric-sql/pglite";
import Migration from "../Migration";

export default class Functionality_00002 extends Migration {
    override async up(db: PGliteInterface): Promise<void> {
        const sql = `
            CREATE TABLE cathedral.functionality (
            -- Additional columns can be added here if needed
            )
            INHERITS (cathedral.behavior);

            ALTER TABLE cathedral.functional_behavior INHERIT cathedral.functionality;
            ALTER TABLE cathedral.non_functional_behavior INHERIT cathedral.functionality;
        `

        await db.exec(sql)
    }
    override async down(db: PGliteInterface): Promise<void> {
        const sql = `
            ALTER TABLE cathedral.functional_behavior NO INHERIT cathedral.behavior;
            ALTER TABLE cathedral.non_functional_behavior NO INHERIT cathedral.behavior;

            DROP TABLE cathedral.functionality;
        `

        await db.exec(sql)
    }

}