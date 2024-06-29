import { type Constructor } from '~/lib/Constructor';
import type ValueObject from '~/domain/ValueObject';
import type ValueRepository from '~/data/ValueRepository';
import PGLiteRepository from './PGLiteRepository';
import reCamelCaseToSnakeCase from '~/lib/reCamelCaseToSnakeCase';
import reSnakeCaseToCamelCase from '~/lib/reSnakeCaseToCamelCase';
import type { Properties } from '~/domain/Properties';

export default abstract class PGLiteValueRepository<V extends ValueObject> extends PGLiteRepository implements ValueRepository<V> {
    constructor(
        private readonly _tableName: string,
        private readonly _Constructor: Constructor<V>
    ) { super() }

    async add(item: Properties<V>): Promise<void> {
        const conn = PGLiteValueRepository.conn

        const sql = `
            INSERT INTO ${this._tableName} (${Object.keys(item).map(reCamelCaseToSnakeCase).join(', ')})
            VALUES (${Object.keys(item).map((_, index) => `$${index + 1}`).join(', ')})
        `

        await conn.query(
            sql, Object.values(item)
        )
    }

    async getAll(criteria: Partial<Properties<V>> = {}): Promise<V[]> {
        const conn = PGLiteValueRepository.conn

        const sql = `
            SELECT * FROM ${this._tableName}
            ${this._criteriaToSql(criteria)}
        `

        const results = (await conn.query<V>(
            sql, Object.values(criteria ?? {})
        )).rows

        return results.map(result => new this._Constructor(
            Object.fromEntries(
                Object.entries(result).map(([key, value]) => [reSnakeCaseToCamelCase(key), value])
            )
        ))
    }

    async delete(item: Properties<V>): Promise<void> {
        const conn = PGLiteValueRepository.conn

        const sql = `
            DELETE FROM ${this._tableName}
            WHERE ${Object.keys(item).map(reCamelCaseToSnakeCase).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}
        `

        await conn.query(
            sql, Object.values(item)
        )
    }
}