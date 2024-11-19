import { z } from "zod"
import { getServerSession } from '#auth'
import { fork } from "~/server/data/orm.js"
import { OrganizationInteractor } from "~/application"

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
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationSlug
        })

    return organizationInteractor.getAuditLogDeleteHistory(entityName)
})