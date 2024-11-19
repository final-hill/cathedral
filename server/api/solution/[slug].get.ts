import { getServerSession } from '#auth'
import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { OrganizationInteractor } from '~/application'

const paramSchema = z.object({
    slug: z.string().max(100)
})

const querySchema = z.object({
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationId,
            organizationSlug
        })

    return await organizationInteractor.getSolutionBySlug(slug)
})
