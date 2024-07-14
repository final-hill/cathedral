import PostgresRepository from "./PostgresRepository";
import EnvironmentComponent from "~/server/domain/EnvironmentComponent";
import { type Uuid } from "~/server/domain/Uuid";

export default class EnvironmentComponentRepository extends PostgresRepository<EnvironmentComponent> {
    async add(item: Omit<EnvironmentComponent, 'id'>): Promise<Uuid> {
        // environment_component <: component <: actor <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_act AS (
                INSERT INTO cathedral.actor (id)
                VALUES ((SELECT id FROM new_req))
                RETURNING id
            ),
            new_comp AS (
                INSERT INTO cathedral.component (id, parent_component_id)
                VALUES ((SELECT id FROM new_act), $4)
                RETURNING id
            ),
            new_env_comp AS (
                INSERT INTO cathedral.environment_component (id)
                VALUES ((SELECT id FROM new_comp))
                RETURNING id
            )
            SELECT id FROM new_req
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.parentComponentId
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<EnvironmentComponent> = {}): Promise<EnvironmentComponent[]> {
        // environment_component <: component <: actor <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, c.parent_component_id
            FROM cathedral.requirement r
            JOIN cathedral.actor a ON r.id = a.id
            JOIN cathedral.component c ON a.id = c.id
            JOIN cathedral.environment_component e ON c.id = e.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: EnvironmentComponent['id'],
            name: EnvironmentComponent['name'],
            solution_id: EnvironmentComponent['solutionId'],
            statement: EnvironmentComponent['statement'],
            parent_component_id: EnvironmentComponent['parentComponentId']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new EnvironmentComponent({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            parentComponentId: item.parent_component_id
        }));
    }

    async update(item: EnvironmentComponent): Promise<void> {
        // environment_component <: component <: actor <: requirement (Class Table Inheritance)
        // There are no additional fields in the environment_component table
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
            )
            UPDATE cathedral.component
            SET parent_component_id = $5
            WHERE id = $4
        `;

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.parentComponentId
        ]);
    }
}
