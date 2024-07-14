import PostgresRepository from "./PostgresRepository";
import Constraint from "~/server/domain/Constraint";
import { type Uuid } from "~/server/domain/Uuid";

// "constraint" is a reserved word in SQLite so we need to escape it

export default class ConstraintRepository extends PostgresRepository<Constraint> {
    async add(item: Omit<Constraint, 'id'>): Promise<Uuid> {
        // constraint <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_con AS (
                INSERT INTO cathedral."constraint" (id, category_id)
                VALUES ((SELECT id FROM new_req), $4)
            )
            SELECT id FROM new_req
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.categoryId
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<Constraint> = {}): Promise<Constraint[]> {
        // constraint <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, c.category_id
            FROM cathedral.requirement r
            JOIN cathedral."constraint" c ON r.id = c.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Constraint['id'],
            name: Constraint['name'],
            solution_id: Constraint['solutionId'],
            statement: Constraint['statement'],
            category_id: Constraint['categoryId']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Constraint({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            categoryId: item.category_id
        }))
    }

    async update(item: Constraint): Promise<void> {
        // constraint <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
            )
            UPDATE cathedral."constraint"
            SET category_id = $5
            WHERE id = $4
        `

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.categoryId
        ]);
    }
}
