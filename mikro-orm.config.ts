// This file is referenced by the application as well as the migration CLI
// The CLI use case requires the direct and indirect imports to have a .js extension.
// Additionally, the imports can not use '~'
import dotenv from "dotenv";
import { type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import * as entities from "./server/domain/index.js";
import AuditSubscriber from "./server/data/subscribers/AuditSubscriber.js";

dotenv.config();
const config: Options = {
    extensions: [Migrator],
    driver: PostgreSqlDriver,
    dbName: process.env.POSTGRES_DB!,
    user: process.env.POSTGRES_USER!,
    host: process.env.POSTGRES_HOST!,
    password: process.env.POSTGRES_PASSWORD!,
    port: parseInt(process.env.POSTGRES_PORT!),
    // https://github.com/mikro-orm/mikro-orm/issues/303
    driverOptions: {
        connection: { ssl: true }
    },
    entities: Object.values(entities)
        .filter((entity) => typeof entity === 'function'),
    discovery: { disableDynamicFileAccess: true },
    seeder: {},
    subscribers: [new AuditSubscriber()],
    forceUtcTimezone: true,
    metadataProvider: TsMorphMetadataProvider,
    debug: process.env.NODE_ENV !== 'production',
    migrations: {
        transactional: true
    }
};

export default config;