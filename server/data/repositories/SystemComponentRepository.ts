import SystemComponent from "~/server/domain/requirements/SystemComponent";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class SystemComponentRepository extends PostgresRepository<SystemComponent> {
    async add(item: Omit<SystemComponent, 'id'>): Promise<Uuid> {
        // system_component <: component <: actor <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_actor AS (
                INSERT INTO cathedral.actor (id)
                VALUES ((SELECT id FROM new_req))
                RETURNING id
            ),
            new_comp AS (
                INSERT INTO cathedral.component (id, parent_component_id)
                VALUES ((SELECT id FROM new_req), (SELECT id FROM new_actor))
                RETURNING id
            ),
            new_sys_comp AS (
                INSERT INTO cathedral.system_component (id)
                VALUES ((SELECT id FROM new_req))
                RETURNING id
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

    async getAll(criteria: Partial<SystemComponent> = {}): Promise<SystemComponent[]> {
        // system_component <: component <: actor <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id,
                   r.name,
                   r.solution_id,
                   r.statement,
                   c.parent_component_id
            FROM cathedral.requirement r
            JOIN cathedral.actor a ON r.id = a.id
            JOIN cathedral.component c ON a.id = c.id
            JOIN cathedral.system_component e ON c.id = e.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: SystemComponent['id'],
            name: SystemComponent['name'],
            solution_id: SystemComponent['solutionId'],
            statement: SystemComponent['statement'],
            parent_component_id: SystemComponent['parentComponentId']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((item) => new SystemComponent({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            parentComponentId: item.parent_component_id
        }))
    }

    async update(item: SystemComponent): Promise<void> {
        // system_component <: component <: actor <: requirement (Class Table Inheritance)
        // There are no additional fields in the system_component table
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
        `

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.parentComponentId
        ]);
    }
}
