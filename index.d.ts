import type { Connection, EntityManager, IDatabaseDriver, MikroORM, PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql'

// see: /server/middleware/mikroorm.ts
type EM = SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>
declare module 'h3' {
    interface H3EventContext {
        orm: MikroORM<PostgreSqlDriver, EM>
        em: EM
    }
}

export { }
