import AppUser from "~/server/domain/application/AppUser";
import PostgresRepository from "./PostgresRepository";

export default class AppUserRepository extends PostgresRepository<AppUser> {
    async add(item: AppUser): Promise<string> {
        // Ignoring the creation date in preference of the database's default value
        const sql = `
            INSERT INTO cathedral.appuser (id, default_organization_id)
            VALUES ($1, $2)
            RETURNING id
        `;

        const result = await this._db.query(sql, [
            item.id,
            item.defaultOrganizationId
        ]);

        return result.rows[0].id;
    }

    override async delete(id: string): Promise<void> {
        const sql = `
            DELETE FROM cathedral.appuser
            WHERE id = $1
        `;

        await this._db.query(sql, [id]);
    }

    async getAll(criteria: Partial<AppUser> = {}): Promise<AppUser[]> {
        const sql = `
            SELECT id, default_organization_id, creation_date
            FROM cathedral.appuser
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: AppUser['id'],
            default_organization_id: AppUser['defaultOrganizationId'],
            creation_date: string
        };

        const results = await this._db.query<ResponseModel>(sql, Object.values(criteria));

        return results.rows.map((item) => new AppUser({
            id: item.id,
            defaultOrganizationId: item.default_organization_id,
            creationDate: new Date(item.creation_date)
        }));
    }

    async update(item: AppUser): Promise<void> {
        // Ignoring the creation date
        const sql = `
            UPDATE cathedral.appuser
            SET default_organization_id = $2
            WHERE id = $1
        `;

        await this._db.query(sql, [item.id, item.defaultOrganizationId]);
    }
}