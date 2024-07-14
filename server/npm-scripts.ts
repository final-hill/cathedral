// This file is executed from the package.json scripts
import 'dotenv/config'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { query, transaction } from './data/db';

const fileName = fileURLToPath(import.meta.url),
    migrationDirName = path.join(path.dirname(fileName), './data/migrations'),
    sqlFiles = fs.readdirSync(migrationDirName).filter(file => file.endsWith('.sql'));

/**
 * Gets the names of the migrations that have been executed
 */
const getExecutedMigrationNames = async (): Promise<string[]> => {
    const tableExists = (await query(
        `SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'cathedral'
            AND table_name = '__migration_history'
        )`,
        []
    )).rows[0].exists
    if (tableExists)
        return (await query<{ name: string }>(`SELECT name FROM cathedral.__migration_history`, [])).rows.map((row) => row.name)
    else
        return []
}

/**
 * Returns the migrations that have not been executed
 * @param executedMigrationNames - The names of the migrations that have been executed
 */
const getPendingMigrations = (executedMigrationNames: string[]) => {
    // Map<MigrationName, SqlText>
    const pendingMigrations = new Map<string, string>(),
        // migration files are of the form: 00001-name.up.sql or 00001-name.down.sql
        upMigrationFiles = sqlFiles.filter(migration => migration.endsWith('.up.sql'))

    for (const migration of upMigrationFiles) {
        const migrationName = migration.split('.')[0];

        if (!executedMigrationNames.includes(migrationName))
            pendingMigrations.set(migrationName, fs.readFileSync(`${migrationDirName}/${migration}`, 'utf8'))
    }

    return pendingMigrations
}

const commands: Record<string, () => void> = {
    /**
     * Migrates the database to the latest version
     */
    async "migrate-up"() {
        console.log(`Migrating database to latest version...`)

        const executedMigrationNames = await getExecutedMigrationNames(),
            pendingMigrations = getPendingMigrations(executedMigrationNames)

        try {
            for (const [migrationName, sql] of pendingMigrations) {
                transaction(async (client) => {
                    await client.query(sql);
                    await client.query(
                        `INSERT INTO cathedral.__migration_history (name, execution_date) VALUES ($1, $2)`,
                        [migrationName, new Date().toISOString()]
                    );
                })
            }
        } catch (error) {
            console.error(`Error migrating database: ${error}`)
            return
        }

        console.log(`Database migrated successfully!`)
    },
    /**
     * Rolls back the database by ONE migration
     */
    async "migrate-down"() {
        console.log(`Rolling back database to previous version...`)
        const executedMigrationNames = await getExecutedMigrationNames();

        if (executedMigrationNames.length === 0) {
            console.log(`No migrations to roll back`)
            return
        }

        const lastMigrationName = executedMigrationNames.at(-1),
            lastMigration = fs.readFileSync(`${migrationDirName}/${lastMigrationName}.down.sql`, 'utf8');

        try {
            transaction(async (client) => {
                client.query(lastMigration);
                // test if the __migration_history table exists before deleting the last migration
                // this is to prevent an error when rolling back the first migration
                const tableExists = (await query(
                    `SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'cathedral'
                        AND table_name = '__migration_history'
                    )`,
                    []
                )).rows[0].exists
                if (tableExists)
                    await client.query(`DELETE FROM cathedral.__migration_history WHERE name = $1`, [lastMigrationName])
            })
        } catch (error) {
            console.error(`Error rolling back database: ${error}`)
        }

        console.log(`Database rolled back successfully!`)
    }
};

commands[process.argv[2]]();