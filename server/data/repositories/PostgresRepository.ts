import Repository from '~/server/application/Repository';
import type Entity from '~/server/domain/Entity';
import { query, transaction } from '../db'
import reCamelCaseToSnakeCase from '~/lib/reCamelCaseToSnakeCase';

export default abstract class PostgresRepository<E extends Entity<any>> extends Repository<E> {
    protected _db = { query, transaction }

    async get(id: E['id']): Promise<E | undefined> {
        return (await (this.getAll({ id } as Record<keyof E, any>)))[0]
    }

    async delete(id: E['id']): Promise<void> {
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