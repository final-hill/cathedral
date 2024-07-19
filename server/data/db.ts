// https://node-postgres.com/
import pg, { type PoolClient, type QueryResultRow } from 'pg'
const { Pool } = pg

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT!),
    database: process.env.POSTGRES_DB
})

export const query = <R extends QueryResultRow>(text: string, params: any[]) => {
    return pool.query<R>(text, params)
}

export const transaction = async (
    fn: (client: PoolClient) => Promise<void>
) => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        await fn(client)
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        console.error('Error in transaction', e)
        throw e
    } finally {
        client.release()
    }
}