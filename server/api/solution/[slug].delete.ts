import { getServerSession } from '#auth'
import config from '~/mikro-orm.config'
import { z } from "zod"
import { OrganizationInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories/OrganizationRepository'

const paramSchema = z.object({
    slug: z.string().max(100)
})

const bodySchema = z.object({
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Delete a solution by slug.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({ config, organizationId, organizationSlug })
        })

    await organizationInteractor.deleteSolutionBySlug(slug)
})
