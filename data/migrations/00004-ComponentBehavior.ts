import type { PGliteInterface } from "@electric-sql/pglite"
import Migration from "../Migration"

export default class ComponentBehavior_00004 extends Migration {
    override async up(db: PGliteInterface): Promise<void> {
        const sql = `
            ALTER TABLE cathedral.behavior
            DROP COLUMN component_id;

            CREATE TABLE cathedral.environment_component ()
            INHERITS (cathedral.component);

            CREATE TABLE cathedral.system_component ()
            INHERITS (cathedral.component);

            CREATE TABLE cathedral.component_functionality (
                solution_id UUID NOT NULL REFERENCES cathedral.solution(id),
                component_id UUID NOT NULL,
                functionality_id UUID NOT NULL,
                PRIMARY KEY (component_id, functionality_id)
            );
        `

        await db.exec(sql)
    }

    override async down(db: PGliteInterface): Promise<void> {
        const sql = `
            ALTER TABLE cathedral.behavior
            ADD COLUMN component_id UUID NOT NULL;

            DROP TABLE cathedral.environment_component;

            DROP TABLE cathedral.system_component;

            DROP TABLE cathedral.component_functionality;
        `

        await db.exec(sql)
    }
}