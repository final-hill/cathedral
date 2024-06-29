import { PGlite } from "@electric-sql/pglite";
import Migration from "./Migration";
import InitDatabase_00001 from "./migrations/00001-InitDatabase";
import Functionality_00002 from "./migrations/00002-Functionality";
import BehaviorPriority_00003 from "./migrations/00003-BehaviorPriority";
import ComponentBehavior_00004 from "./migrations/00004-ComponentBehavior";

type MigrationName = `${number}-${string}`

/**
 * Manages the migration of a database
 */
export default class MigrationManager {
    private _migrations = new Map<MigrationName, typeof Migration>([
        ["00001-InitDatabase", InitDatabase_00001],
        ["00002-Functionality", Functionality_00002],
        ["00003-BehaviorPriority", BehaviorPriority_00003],
        ["00004-ComponentBehavior", ComponentBehavior_00004]
    ])

    constructor(
        /**
         * The connection string for the database
         */
        private _connString: string
    ) { }

    /**
     * Gets the names of the migrations that have been executed
     * @param db The database to get the executed migration names from
     * @returns The names of the executed migrations
     */
    private async _getExecutedMigrationNames(db: PGlite): Promise<MigrationName[]> {
        let results;
        try {
            results = await db.query(
                `SELECT name FROM cathedral.__migration_history`
            );
        } catch (error) {
            results = { rows: [] };
        }

        return results.rows.map((row: any) => row.name);
    }

    /**
     * Returns the migrations that have not been executed
     * @param executedMigrationNames The names of the migrations that have been executed
     * @returns The names of the pending migrations
     */
    private async _getPendingMigrations(executedMigrationNames: MigrationName[]): Promise<Map<MigrationName, Migration>> {
        const pendingMigrations = new Map<MigrationName, Migration>()

        for (const [migrationName, MigrationCons] of this._migrations) {
            if (!executedMigrationNames.includes(migrationName))
                pendingMigrations.set(migrationName, new (MigrationCons as any)())
        }

        return pendingMigrations
    }

    private async _addMigrationNameToDb(db: PGlite, migrationName: MigrationName) {
        return db.query(
            `INSERT INTO cathedral.__migration_history (Name) VALUES ($1)`,
            [migrationName]
        )
    }

    /**
     * Migrates the database to the latest version
     */
    async migrateToLatest() {
        console.log(`Migrating database to latest version...`)
        const db = new PGlite(this._connString)

        const executedMigrationNames = await this._getExecutedMigrationNames(db),
            pendingMigrations = await this._getPendingMigrations(executedMigrationNames)

        for (const [migrationName, migration] of pendingMigrations) {
            await migration.up(db)
            await this._addMigrationNameToDb(db, migrationName)
        }
        console.log(`Database migrated to latest version`)
    }
}