import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"

const querySchema = z.object({
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Returns all appusers for the organization with their associated roles
 */
export default defineEventHandler(async (event) => {
    const { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        })

    return await organizationInteractor.getOrganizationAppUsers()
})