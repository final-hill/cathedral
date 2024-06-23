import { type PGliteInterface } from "@electric-sql/pglite";
/**
 * Represents a migration that can be run on the database.
 */
export default abstract class Migration {
    /**
     * Applies the migration to the database.
     */
    abstract up(db: PGliteInterface): Promise<void>
    /**
     * Reverts the migration from the database.
     */
    abstract down(db: PGliteInterface): Promise<void>
}