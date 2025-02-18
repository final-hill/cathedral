import type { Connection, EntityManager, IDatabaseDriver, MikroORM, PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql"

type DarkModeOptions = 'light' | 'dark'

declare module 'nuxt/schema' {
    interface AppConfigInput {
        darkMode: DarkModeOptions
    }
}

// see: /server/middleware/mikroorm.ts
type EM = SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>
declare module 'h3' {
    interface H3EventContext {
        orm: MikroORM<PostgreSqlDriver, EM>
        em: EM
    }
}

export { }