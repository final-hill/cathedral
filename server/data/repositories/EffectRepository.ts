import PostgresRepository from "./PostgresRepository";
import Effect from "~/server/domain/requirements/Effect";
import { type Uuid } from "~/server/domain/Uuid";

export default class EffectRepository extends PostgresRepository<Effect> {
    async add(item: Omit<Effect, 'id'>): Promise<Uuid> {
        // effect <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_eff AS (
                INSERT INTO cathedral.effect (id)
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

    async getAll(criteria: Partial<Effect> = {}): Promise<Effect[]> {
        // effect <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.effect e ON r.id = e.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Effect['id'],
            name: Effect['name'],
            solution_id: Effect['solutionId'],
            statement: Effect['statement']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Effect({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }));
    }

    async update(item: Effect): Promise<void> {
        // effect <: requirement (Class Table Inheritance)
        // effect table currently has no fields to update
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
