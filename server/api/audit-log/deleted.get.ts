import { ChangeSetType, QueryOrder } from "@mikro-orm/core"
import { QueryBuilder } from "@mikro-orm/postgresql"
import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AuditLog, Organization } from "~/server/domain"

const querySchema = z.object({
    entityName: z.string(),
    organizationSlug: z.string()
})

/**
 * Returns from the audit history all the deleted entities
 * ordered by the date and time when they were deleted in descending order.
 */
export default defineEventHandler(async (event) => {
    const { entityName, organizationSlug } = await validateEventQuery(event, querySchema),
        em = fork()

    const organization = await em.findOne(Organization, { slug: organizationSlug })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: `Organization not found with the given slug: ${organizationSlug}`
        })

    await assertOrgReader(event, organization.id)

    type RowType = {
        id: string,
        type: ChangeSetType,
        created_at: string,
        entity_id: string,
        entity_name: string,
        entity: string
    }

    const conn = em.getConnection(),
        res: RowType[] = await conn.execute(`
            SELECT d.id, d.type, d.created_at, a.entity_id, a.entity_name, a.entity
            FROM audit_log AS d
            JOIN audit_log AS a
                ON a.entity_id = d.entity_id
                AND a.created_at = (
                    SELECT MAX(a2.created_at)
                    FROM audit_log AS a2
                    WHERE a2.entity_id = d.entity_id
                    AND a2.type IN ('create', 'update')
                    AND a2.created_at < d.created_at
                )
            WHERE d.type = 'delete'
            AND a.entity_name = ?;
    `, [entityName]),
        auditLogs = res.map((row) => ({
            id: row.id,
            createdAt: new Date(row.created_at),
            type: row.type,
            entityId: row.entity_id,
            entityName: row.entity_name,
            entity: row.entity
        }))

    return auditLogs
})