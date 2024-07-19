import Outcome from "~/server/domain/requirements/Outcome";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class OutcomeRepository extends PostgresRepository<Outcome> {
    async add(item: Omit<Outcome, 'id'>): Promise<Uuid> {
        // outcome <: goal <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_goal AS (
                INSERT INTO cathedral.goal (id)
                VALUES ((SELECT id FROM new_req))
            ),
            new_outcome AS (
                INSERT INTO cathedral.outcome (id)
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

    async getAll(criteria: Partial<Outcome> = {}): Promise<Outcome[]> {
        // outcome <: goal <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.goal g ON r.id = g.id
            JOIN cathedral.outcome o ON r.id = o.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Outcome['id'],
            name: Outcome['name'],
            solution_id: Outcome['solutionId'],
            statement: Outcome['statement']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Outcome({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }))
    }

    async update(item: Outcome): Promise<void> {
        // outcome <: goal <: requirement (Class Table Inheritance)
        // currently only the requirement table has fields that can be updated
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
