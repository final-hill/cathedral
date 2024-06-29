import { PGlite } from '@electric-sql/pglite';
import { useAppConfig } from '#app'
import reCamelCaseToSnakeCase from '~/lib/reCamelCaseToSnakeCase';

export default abstract class PGLiteRepository {
    /**
     * The connection to the database.
     */
    static conn = new PGlite(useAppConfig().connString)

    /**
     * Converts a criteria object to a SQL WHERE clause.
     * @param criteria - The criteria object.
     * @returns The SQL WHERE clause.
     */
    protected _criteriaToSql(criteria: Record<string, any>): string {
        const conditions = Object.entries(criteria).map(([key], index) => {
            return `${reCamelCaseToSnakeCase(key)} = $${index + 1}`
        })

        return conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''
    }
}