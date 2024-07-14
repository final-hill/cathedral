import PostgresRepository from "./PostgresRepository";
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior";
import { type Uuid } from "~/server/domain/Uuid";

export default class NonFunctionalBehaviorRepository extends PostgresRepository<NonFunctionalBehavior> {
    async add(item: Omit<NonFunctionalBehavior, 'id'>): Promise<Uuid> {
        // non_functional_behavior <: functionality <: behavior <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_beh AS (
                INSERT INTO cathedral.behavior (id)
                VALUES ((SELECT id FROM new_req))
            ),
            new_fun AS (
                INSERT INTO cathedral.functionality (id)
                VALUES ((SELECT id FROM new_req))
            ),
            new_nfb AS (
                INSERT INTO cathedral.non_functional_behavior (id)
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

    async getAll(criteria: Partial<NonFunctionalBehavior> = {}): Promise<NonFunctionalBehavior[]> {
        // non_functional_behavior <: functionality <: behavior <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, b.priority_id
            FROM cathedral.requirement r
            JOIN cathedral.behavior b ON r.id = b.id
            JOIN cathedral.functionality f ON r.id = f.id
            JOIN cathedral.non_functional_behavior nfb ON r.id = nfb.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: NonFunctionalBehavior['id']
            name: NonFunctionalBehavior['name']
            solution_id: NonFunctionalBehavior['solutionId']
            statement: NonFunctionalBehavior['statement']
            priority_id: NonFunctionalBehavior['priorityId']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return await result.rows.map((item: ResponseModel) => {
            return new NonFunctionalBehavior({
                id: item.id,
                name: item.name,
                solutionId: item.solution_id,
                statement: item.statement,
                priorityId: item.priority_id
            });
        });
    }

    async update(item: NonFunctionalBehavior): Promise<void> {
        // non_functional_behavior <: functionality <: behavior <: requirement (Class Table Inheritance)
        // non_functional_behavior & functionality currently have no additional fields
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
            ),
            UPDATE cathedral.behavior
            SET priority_id = $5
            WHERE id = $4
        `;

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.priorityId
        ]);
    }
}
