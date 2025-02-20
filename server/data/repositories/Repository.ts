import type { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql"

/**
 * A Repository is a class that contains the data access logic for a particular entity
 */
// TODO: E should be a type that extends Entity | ValueObject
// Though more accurately, should be a type that implements Equatable
export abstract class Repository<E> {
    protected _em

    constructor(options: { em: SqlEntityManager<PostgreSqlDriver> }) {
        this._em = options.em
    }
}