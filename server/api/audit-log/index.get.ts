import { QueryOrder } from "@mikro-orm/core"
import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AuditLog, Organization } from "~/server/domain/index.js"

const querySchema = z.object({
    entityId: z.string().uuid(),
    organizationSlug: z.string()
})

/**
 * Returns the audit history of a specific entity
 */
export default defineEventHandler(async (event) => {
    const { entityId, organizationSlug } = await validateEventQuery(event, querySchema),
        em = fork()

    const organization = await em.findOne(Organization, { slug: organizationSlug })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: `Organization not found with the given slug: ${organizationSlug}`
        })

    await assertOrgReader(event, organization.id)

    const results = await em.findAll(AuditLog, {
        where: { entityId },
        orderBy: { createdAt: QueryOrder.DESC }
    })

    return results
})