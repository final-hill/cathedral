import OrganizationRole from "~/server/domain/application/OrganizationRole";
import PostgresRepository from "./PostgresRepository";

export default class OrganizationRoleRepository extends PostgresRepository<OrganizationRole> {
    async add(item: OrganizationRole): Promise<string> {
        const sql = `
            INSERT INTO cathedral.organization_role (id, description)
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
            DELETE FROM cathedral.organization_role
            WHERE id = $1
        `;

        await this._db.query(sql, [id]);
    }

    async getAll(criteria: Partial<OrganizationRole> = {}): Promise<OrganizationRole[]> {
        const sql = `
            SELECT id, description
            FROM cathedral.organization_role
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: OrganizationRole['id'],
            description: OrganizationRole['description']
        };

        const results = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return results.rows.map((item) => new OrganizationRole({
            id: item.id,
            description: item.description
        }));
    }

    async update(item: OrganizationRole): Promise<void> {
        const sql = `
            UPDATE cathedral.organization_role
            SET description = $2
            WHERE id = $1
        `;

        await this._db.query(sql, [item.id, item.description]);
    }
}