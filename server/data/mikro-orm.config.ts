import { resolve, join } from "node:path"
import { defineConfig, BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { Migrator } from '@mikro-orm/migrations';
// https://mikro-orm.io/docs/guide/project-setup#seeding-the-database
import { SeedManager } from '@mikro-orm/seeder';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
// The *.js extension is required for the import to work with the ORM CLI
import Solution from '../domain/Solution.js';

const DB_ROOT = resolve("server/data/db")

export default defineConfig({
    dbName: join(DB_ROOT, 'cathedral.sqlite'),
    // ensureDatabase: true,
    entities: [Solution],
    extensions: [SeedManager, Migrator],
    driver: BetterSqliteDriver,
    metadataProvider: TsMorphMetadataProvider,
    debug: process.env.NODE_ENV !== "production"
})