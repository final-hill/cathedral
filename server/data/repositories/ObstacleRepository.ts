import Obstacle from "~/server/domain/Obstacle";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class ObstacleRepository extends PostgresRepository<Obstacle> {
    async add(item: Omit<Obstacle, 'id'>): Promise<Uuid> {
        // obstacle <: goal <: requirement (Class Table Inheritance)
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
            new_obstacle AS (
                INSERT INTO cathedral.obstacle (id)
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

    async getAll(criteria: Partial<Obstacle> = {}): Promise<Obstacle[]> {
        // obstacle <: goal <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.goal g ON r.id = g.id
            JOIN cathedral.obstacle o ON r.id = o.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Obstacle['id']
            name: Obstacle['name']
            solution_id: Obstacle['solutionId']
            statement: Obstacle['statement']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Obstacle({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }))
    }

    async update(item: Obstacle): Promise<void> {
        // obstacle <: goal <: requirement (Class Table Inheritance)
        // obstacle  and goal currently have no additional fields
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
