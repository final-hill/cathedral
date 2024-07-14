import PostgresRepository from "./PostgresRepository";
import FunctionalBehavior from "~/server/domain/FunctionalBehavior";
import { type Uuid } from "~/server/domain/Uuid";

export default class FunctionalBehaviorRepository extends PostgresRepository<FunctionalBehavior> {
    async add(item: Omit<FunctionalBehavior, 'id'>): Promise<Uuid> {
        // functional_behavior <: functionality <: behavior <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_beh AS (
                INSERT INTO cathedral.behavior (id, priority_id)
                VALUES ((SELECT id FROM new_req), $4)
            ),
            new_fun AS (
                INSERT INTO cathedral.functionality (id)
                VALUES ((SELECT id FROM new_req))
            ),
            new_fun_beh AS (
                INSERT INTO cathedral.functional_behavior (id)
                VALUES ((SELECT id FROM new_req))
            )
            SELECT id FROM new_req
        `;
        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.priorityId
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<FunctionalBehavior> = {}): Promise<FunctionalBehavior[]> {
        // functional_behavior <: functionality <: behavior <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, b.priority_id
            FROM cathedral.requirement r
            JOIN cathedral.behavior b ON r.id = b.id
            JOIN cathedral.functionality f ON r.id = f.id
            JOIN cathedral.functional_behavior fb ON r.id = fb.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: FunctionalBehavior['id'],
            name: FunctionalBehavior['name'],
            solution_id: FunctionalBehavior['solutionId'],
            statement: FunctionalBehavior['statement'],
            priority_id: FunctionalBehavior['priorityId']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((item) => new FunctionalBehavior({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            priorityId: item.priority_id
        }))
    }

    async update(item: FunctionalBehavior): Promise<void> {
        // functional_behavior <: functionality <: behavior <: requirement (Class Table Inheritance)
        // functional_behavior & functionality currently have no additional fields
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
            )
            UPDATE cathedral.behavior
            SET priority_id = $5
            WHERE id = $4
        `

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.priorityId
        ])
    }
}
