import PostgresRepository from "./PostgresRepository";
import Limit from "~/server/domain/Limit";
import { type Uuid } from "~/server/domain/Uuid";

// [limit] is a reserved word in SQL, so we need to escape it
export default class LimitRepository extends PostgresRepository<Limit> {
    async add(item: Omit<Limit, 'id'>): Promise<Uuid> {
        // limit <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_limit AS (
                INSERT INTO cathedral.limit (id)
                VALUES ((SELECT id FROM new_req))
            )
            SELECT id FROM new_req
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<Limit> = {}): Promise<Limit[]> {
        // limit <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.limit l ON r.id = l.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Limit['id']
            name: Limit['name']
            solution_id: Limit['solutionId']
            statement: Limit['statement']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((item) => new Limit({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }))
    }

    async update(item: Limit): Promise<void> {
        // limit <: requirement (Class Table Inheritance)
        // limit currently has no additional fields
        const sql = `
            UPDATE cathedral.requirement
            SET name = $1,
               solution_id = $2,
               statement = $3
            WHERE id = $4
        `;

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id
        ]);
    }
}
