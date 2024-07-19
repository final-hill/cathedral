import PostgresRepository from "./PostgresRepository";
import Assumption from "~/server/domain/requirements/Assumption";
import { type Uuid } from "~/server/domain/Uuid";

export default class AssumptionRepository extends PostgresRepository<Assumption> {
    async add(item: Omit<Assumption, 'id'>): Promise<Uuid> {
        // assumption extends requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_ass AS (
                INSERT INTO cathedral.assumption (id)
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

    async getAll(criteria: Partial<Assumption> = {}): Promise<Assumption[]> {
        // assumption extends requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement
            FROM cathedral.requirement r
            JOIN cathedral.assumption a ON r.id = a.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Assumption['id'],
            name: Assumption['name'],
            solution_id: Assumption['solutionId'],
            statement: Assumption['statement']
        };

        const results = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return results.rows.map((item) => new Assumption({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement
        }));
    }

    async update(item: Assumption): Promise<void> {
        // assumption extends requirement (Class Table Inheritance)
        // but there are currently no additional fields in the assumption table
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
