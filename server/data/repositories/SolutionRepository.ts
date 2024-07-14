import Solution from "~/server/domain/Solution";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class SolutionRepository extends PostgresRepository<Solution> {
    async add(item: Omit<Solution, 'id'>): Promise<Uuid> {
        const sql = `
            WITH new_sol AS (
                INSERT INTO cathedral.solution (name, description)
                VALUES ($1, $2)
                RETURNING id
            )
            SELECT id FROM new_sol
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.description
        ]);

        return result.rows[0].id;
    }

    override async delete(id: Uuid): Promise<void> {
        const sql = `
            DELETE FROM cathedral.solution
            WHERE id = $1
        `

        await this._db.query(sql, [id])
    }

    async getAll(criteria: Partial<Solution> = {}): Promise<Solution[]> {
        const sql = `
            SELECT id, name, description, slug
            FROM cathedral.solution
            ${this._criteriaToSql(criteria)}
        `

        type ResponseModel = {
            id: Solution['id']
            name: Solution['name']
            description: Solution['description']
            slug: Solution['slug']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((item) => new Solution({
            id: item.id,
            name: item.name,
            description: item.description,
            slug: item.slug
        }))
    }

    async update(item: Solution): Promise<void> {
        const sql = `
            UPDATE cathedral.solution
            SET name = $1,
                description = $2
            WHERE id = $3
        `

        await this._db.query(sql, [
            item.name,
            item.description,
            item.id
        ])
    }
}