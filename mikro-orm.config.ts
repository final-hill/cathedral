// This file is referenced by the application as well as the migration CLI
// The CLI use case requires the direct and indirect imports to have a .js extension.
// Additionally, the imports can not use '~'
import dotenv from 'dotenv'
import { MikroORM, PopulateHint, PostgreSqlDriver } from '@mikro-orm/postgresql'
import type { Options } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'
import * as entities from './server/data/models/requirements/index.js'
import * as appEntities from './server/data/models/application/index.js'

dotenv.config()
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
    entities: [
        ...Object.values(entities),
        ...Object.values(appEntities)
    ],
    ignoreUndefinedInQuery: true,
    populateWhere: PopulateHint.INFER,
    discovery: { disableDynamicFileAccess: true },
    seeder: {},
    forceUtcTimezone: true,
    metadataProvider: TsMorphMetadataProvider,
    debug: process.env.NODE_ENV !== 'production',
    migrations: { transactional: true }
}

let connection: ReturnType<typeof MikroORM.init> | undefined

export const getConnection = async () => {
    return connection ? connection : (connection = MikroORM.init(config))
}

export default config
