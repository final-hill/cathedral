import { getServerSession } from '#auth'
import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { OrganizationInteractor } from "~/application"

const querySchema = z.object({
    name: z.string().max(100).optional(),
    description: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
    slug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Returns all solutions that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug, slug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        })

    return await organizationInteractor.findSolutions({ description, name, slug })
})