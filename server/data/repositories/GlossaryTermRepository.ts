import PostgresRepository from "./PostgresRepository";
import GlossaryTerm from "~/server/domain/GlossaryTerm";
import { type Uuid } from "~/server/domain/Uuid";

export default class GlossaryTermRepository extends PostgresRepository<GlossaryTerm> {
    async add(item: Omit<GlossaryTerm, 'id'>): Promise<Uuid> {
        // glossary_term <: component <: actor <: requirement (Class Table Inheritance)
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
            new_gloss_term AS (
                INSERT INTO cathedral.glossary_term (id)
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

    async getAll(criteria: Partial<GlossaryTerm> = {}): Promise<GlossaryTerm[]> {
        // glossary_term <: component <: actor <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, c.parent_component_id
            FROM cathedral.requirement r
            JOIN cathedral.actor a ON r.id = a.id
            JOIN cathedral.component c ON r.id = c.id
            JOIN cathedral.glossary_term g ON r.id = g.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: GlossaryTerm['id']
            name: GlossaryTerm['name']
            solution_id: GlossaryTerm['solutionId']
            statement: GlossaryTerm['statement']
            parent_component_id: GlossaryTerm['parentComponentId']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => {
            return new GlossaryTerm({
                id: item.id,
                name: item.name,
                solutionId: item.solution_id,
                statement: item.statement,
                parentComponentId: item.parent_component_id
            });
        });
    }

    async update(item: GlossaryTerm): Promise<void> {
        // glossary_term <: component <: actor <: requirement (Class Table Inheritance)
        // besides the requirement table, there are additional fields in the child tables
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
