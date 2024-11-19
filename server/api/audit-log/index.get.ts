import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"

const querySchema = z.object({
    entityId: z.string().uuid(),
    organizationSlug: z.string()
})

/**
 * Returns the audit history of a specific entity
 */
export default defineEventHandler(async (event) => {
    const { entityId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationSlug
        })

    return await organizationInteractor.getAuditLogHistory(entityId)
})