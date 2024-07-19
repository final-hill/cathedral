import PostgresRepository from "./PostgresRepository";
import Person from "~/server/domain/requirements/Person";
import { type Uuid } from "~/server/domain/Uuid";

export default class PersonRepository extends PostgresRepository<Person> {
    async add(item: Omit<Person, 'id'>): Promise<Uuid> {
        // person <: actor <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_actor AS (
                INSERT INTO cathedral.actor (id)
                VALUES ((SELECT id FROM new_req))
            ),
            new_person AS (
                INSERT INTO cathedral.person (id, email)
                VALUES ((SELECT id FROM new_req), $4)
            )
            SELECT id FROM new_req
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.email
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<Person> = {}): Promise<Person[]> {
        // person <: actor <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id, r.name, r.solution_id, r.statement, p.email
            FROM cathedral.requirement r
            JOIN cathedral.actor a ON r.id = a.id
            JOIN cathedral.person p ON r.id = p.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: Person['id'],
            name: Person['name'],
            solution_id: Person['solutionId'],
            statement: Person['statement'],
            email: Person['email']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return result.rows.map((item) => new Person({
            id: item.id,
            name: item.name,
            solutionId: item.solution_id,
            statement: item.statement,
            email: item.email
        }))
    }

    async update(item: Person): Promise<void> {
        // person <: actor <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
                RETURNING id
            )
            UPDATE cathedral.person
            SET email = $5
            WHERE id = $4
        `;

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.email
        ]);
    }
}
