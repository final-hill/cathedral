import Component from "~/server/domain/Component";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class ComponentRepository extends PostgresRepository<Component> {
    async add(item: Omit<Component, 'id'>): Promise<Uuid> {
        // component <: actor <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_act AS (
                INSERT INTO cathedral.actor (id)
            ),
            new_comp AS (
                INSERT INTO cathedral.component (id, parent_component_id)
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

    async getAll(criteria: Partial<Component> = {}): Promise<Component[]> {
        // component <: actor <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, a.parent_component_id
            FROM cathedral.requirement r
            JOIN cathedral.actor a ON r.id = a.id
            JOIN cathedral.component c ON a.id = c.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Component['id'],
            name: Component['name'],
            solution_id: Component['solutionId'],
            statement: Component['statement'],
            parent_component_id: Component['parentComponentId']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Component({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            parentComponentId: item.parent_component_id
        }));
    }

    async update(item: Component): Promise<void> {
        // component <: actor <: requirement (Class Table Inheritance)
        // but there are additional fields in the component table
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
            ),
            new_comp AS (
                UPDATE cathedral.component
                SET parent_component_id = $5
                WHERE id = $6
            )
        `;

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.parentComponentId,
            item.id
        ]);
    }
}
