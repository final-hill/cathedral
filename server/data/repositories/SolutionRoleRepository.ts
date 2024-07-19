import PostgresRepository from "./PostgresRepository";
import SolutionRole from "~/server/domain/application/SolutionRole";

export default class SolutionRoleRepository extends PostgresRepository<SolutionRole> {
    async add(item: SolutionRole): Promise<string> {
        const sql = `
            INSERT INTO cathedral.solution_role (id, description)
            VALUES ($1, $2)
            RETURNING id
        `;

        const result = await this._db.query(sql, [
            item.id,
            item.description
        ]);

        return result.rows[0].id;
    }

    async delete(id: string): Promise<void> {
        const sql = `
            DELETE FROM cathedral.solution_role
            WHERE id = $1
        `;

        await this._db.query(sql, [id]);
    }

    async getAll(criteria: Partial<SolutionRole> = {}): Promise<SolutionRole[]> {
        const sql = `
            SELECT id, description
            FROM cathedral.solution_role
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: SolutionRole['id'],
            description: SolutionRole['description']
        };

        const results = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return results.rows.map((item) => new SolutionRole({
            id: item.id,
            description: item.description
        }));
    }

    async update(item: SolutionRole): Promise<void> {
        const sql = `
            UPDATE cathedral.solution_role
            SET description = $2
            WHERE id = $1
        `;

        await this._db.query(sql, [item.id, item.description]);
    }
}