import Goal from "~/server/domain/requirements/Goal";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class GoalRepository extends PostgresRepository<Goal> {
    async add(item: Omit<Goal, 'id'>): Promise<Uuid> {
        // goal <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_goal AS (
                INSERT INTO cathedral.goal (id)
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

    async getAll(criteria: Partial<Goal> = {}): Promise<Goal[]> {
        // goal <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.goal g ON r.id = g.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Goal['id']
            name: Goal['name']
            solution_id: Goal['solutionId']
            statement: Goal['statement']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Goal({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }));
    }

    async update(item: Goal): Promise<void> {
        // goal <: requirement (Class Table Inheritance)
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
