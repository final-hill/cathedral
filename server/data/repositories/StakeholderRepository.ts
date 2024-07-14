import PostgresRepository from "./PostgresRepository";
import Stakeholder from "~/server/domain/Stakeholder";
import { type Uuid } from "~/server/domain/Uuid";

export default class StakeholderRepository extends PostgresRepository<Stakeholder> {
    async add(item: Omit<Stakeholder, 'id'>): Promise<Uuid> {
        // stakeholder <: component <: actor <: requirement (Class Table Inheritance)
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
                VALUES ((SELECT id FROM new_actor), NULL)
                RETURNING id
            ),
            new_stakeholder AS (
                INSERT INTO cathedral.stakeholder (id, influence, availability, segmentation_id, category_id)
                VALUES ((SELECT id FROM new_comp), $4, $5, $6, $7)
                RETURNING id
            )
            SELECT id FROM new_req

        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.influence,
            item.availability,
            item.segmentationId,
            item.categoryId
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<Stakeholder> = {}): Promise<Stakeholder[]> {
        // stakeholder <: component <: actor <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id,
                   r.name,
                   r.solution_id,
                   r.statement,
                   s.influence,
                   s.availability,
                   s.segmentation_id,
                   s.category_id,
                   c.parent_component_id
            FROM cathedral.requirement r
            JOIN cathedral.actor a ON r.id = a.id
            JOIN cathedral.component c ON a.id = c.id
            JOIN cathedral.stakeholder s ON c.id = s.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Stakeholder['id'],
            name: Stakeholder['name'],
            solution_id: Stakeholder['solutionId'],
            statement: Stakeholder['statement'],
            influence: Stakeholder['influence'],
            availability: Stakeholder['availability'],
            segmentation_id: Stakeholder['segmentationId'],
            category_id: Stakeholder['categoryId'],
            parent_component_id: Stakeholder['parentComponentId']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Stakeholder({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            influence: item.influence,
            availability: item.availability,
            segmentationId: item.segmentation_id,
            categoryId: item.category_id,
            parentComponentId: item.parent_component_id
        }))
    }

    async update(item: Stakeholder): Promise<void> {
        // stakeholder <: component <: actor <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
                RETURNING id
            ),
            new_comp AS (
                UPDATE cathedral.component
                SET parent_component_id = NULL
                WHERE id = $4
            )
            UPDATE cathedral.stakeholder
            SET influence = $5,
                availability = $6,
                segmentation_id = $7,
                category_id = $8
            WHERE id = $4
        `;

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.influence,
            item.availability,
            item.segmentationId,
            item.categoryId
        ]);
    }
}
