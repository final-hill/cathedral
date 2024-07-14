import PostgresRepository from "./PostgresRepository";
import Invariant from "~/server/domain/Invariant";
import { type Uuid } from "~/server/domain/Uuid";

export default class InvariantRepository extends PostgresRepository<Invariant> {
    async add(item: Omit<Invariant, 'id'>): Promise<Uuid> {
        // invariant <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_inv AS (
                INSERT INTO cathedral.invariant (id)
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

    async getAll(criteria: Partial<Invariant> = {}): Promise<Invariant[]> {
        // invariant <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.invariant i ON r.id = i.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Invariant['id']
            name: Invariant['name']
            solution_id: Invariant['solutionId']
            statement: Invariant['statement']
        };

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Invariant({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }));
    }

    async update(item: Invariant): Promise<void> {
        // invariant <: requirement (Class Table Inheritance)
        // invariant currently has no additional fields
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
