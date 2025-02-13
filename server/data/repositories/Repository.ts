import { MikroORM, type Options } from "@mikro-orm/postgresql"

/**
 * A Repository is a class that contains the data access logic for a particular entity
 */
// TODO: E should be a type that extends Entity | ValueObject
// Though more accurately, should be a type that implements Equatable
export abstract class Repository<E> {
    protected _orm
    protected _config

    constructor(options: { config: Options }) {
        this._config = options.config
        this._orm = MikroORM.initSync(options.config)
    }

    /**
     * Returns new EntityManager instance with its own identity map
     */
    protected _fork() { return this._orm.em.fork() }
}