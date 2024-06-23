import Repository from '~/application/Repository';
import type Entity from '~/domain/Entity';
import type { Properties } from '~/domain/Properties';
import type { Uuid } from '~/domain/Uuid';

const reCamelCaseToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

const reSnakeCaseToCamelCase = (str: string) => str.replace(/_./g, match => match[1].toUpperCase())

type Constructor<T> = { new(...args: any[]): T }

export default abstract class PGLiteRepository<E extends Entity> extends Repository<E> {
    constructor(
        private readonly _tableName: string,
        private readonly _Constructor: Constructor<E>
    ) { super() }

    async create(item: Omit<Properties<E>, 'id'>): Promise<Uuid> {
        const conn = PGLiteRepository.conn

        const sql = `
            INSERT INTO ${this._tableName} (${Object.keys(item).map(reCamelCaseToSnakeCase).join(', ')})
            VALUES (${Object.keys(item).map((_, index) => `$${index + 1}`).join(', ')})
            RETURNING id
        `

        const result = (await conn.query<{ id: Uuid }>(
            sql, Object.values(item)
        )).rows[0]

        return result.id
    }

    async get(id: Uuid): Promise<E | undefined> {
        return (await this.getAll({ id } as Record<keyof E, any>))[0]
    }

    async getAll(criteria: Partial<Properties<E>> = {}): Promise<E[]> {
        const conn = PGLiteRepository.conn

        const sql = `
            SELECT * FROM ${this._tableName}
            ${this._criteriaToSql(criteria)}
        `

        const results = (await conn.query<E>(
            sql, Object.values(criteria ?? {})
        )).rows

        return results.map(result => new this._Constructor(
            Object.fromEntries(
                Object.entries(result).map(([key, value]) => [reSnakeCaseToCamelCase(key), value])
            )
        ))
    }

    async delete(id: Uuid): Promise<void> {
        const conn = PGLiteRepository.conn

        const sql = `
            DELETE FROM ${this._tableName}
            WHERE id = $1
        `

        await conn.query(sql, [id])
    }

    async update(item: Properties<E>): Promise<void> {
        const conn = PGLiteRepository.conn

        const sql = `
            UPDATE ${this._tableName}
            SET ${Object.keys(item).map((key, index) => `${reCamelCaseToSnakeCase(key)} = $${index + 1}`).join(', ')}
            WHERE id = $${Object.keys(item).length + 1}
        `

        await conn.query(sql, [...Object.values(item), (item as any).id])
    }

    protected _criteriaToSql(criteria: Record<string, any>): string {
        const conditions = Object.entries(criteria).map(([key], index) => {
            return `${reCamelCaseToSnakeCase(key)} = $${index + 1}`
        })

        return conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''
    }
}