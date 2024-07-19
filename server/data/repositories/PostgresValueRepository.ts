import Repository from '~/server/application/Repository';
import { query, transaction } from '../db'
import reCamelCaseToSnakeCase from '~/lib/reCamelCaseToSnakeCase';
import type ValueObject from '~/server/domain/ValueObject';

export default abstract class PostgresValueRepository<V extends ValueObject> extends Repository<V> {
    protected _db = { query, transaction }

    async get(id: V): Promise<V | undefined> {
        return (await (this.getAll({ id } as Record<keyof V, any>)))[0]
    }

    async delete(id: ): Promise<void> {
        // most tables extend requirement (Class Table Inheritance)
        // deleting from the requirement table will delete from descendant tables
        const sql = `
            DELETE FROM cathedral.requirement
            WHERE id = $1
        `

        await this._db.query(sql, [id])
    }

    protected _criteriaToSql(criteria: Record<string, any>): string {
        const conditions = Object.entries(criteria).map(([key], index) => {
            return `${reCamelCaseToSnakeCase(key)} = $${index + 1}`
        })

        return conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''
    }
}