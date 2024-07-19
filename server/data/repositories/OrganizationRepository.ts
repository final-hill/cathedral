import Organization from "~/server/domain/application/Organization";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class OrganizationRepository extends PostgresRepository<Organization> {
    async add(item: Omit<Organization, 'id'>): Promise<Uuid> {
        const sql = `
            WITH new_org AS (
                INSERT INTO cathedral.organization (name, description)
                VALUES ($1, $2)
                RETURNING id
            )
            SELECT id FROM new_org
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.description
        ]);

        return result.rows[0].id;
    }

    override async delete(id: Uuid): Promise<void> {
        const sql = `
            DELETE FROM cathedral.organization
            WHERE id = $1
        `

        await this._db.query(sql, [id])
    }

    async getAll(criteria: Partial<Organization> = {}): Promise<Organization[]> {
        const sql = `
            SELECT id, name, description, slug
            FROM cathedral.organization
            ${this._criteriaToSql(criteria)}
        `

        type ResponseModel = {
            id: Organization['id']
            name: Organization['name']
            description: Organization['description']
            slug: Organization['slug']
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((item) => new Organization({
            id: item.id,
            name: item.name,
            description: item.description,
            slug: item.slug
        }))
    }

    async update(item: Organization): Promise<void> {
        const sql = `
            UPDATE cathedral.organization
            SET name = $1,
                description = $2
            WHERE id = $3
        `

        await this._db.query(sql, [
            item.name,
            item.description,
            item.id
        ])
    }
}