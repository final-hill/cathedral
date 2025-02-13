import { getServerSession } from '#auth'
import { z } from "zod"
import { OrganizationInteractor } from "~/application"
import config from '~/mikro-orm.config'
import { OrganizationRepository } from '~/server/data/repositories/OrganizationRepository'
import handleDomainException from '~/server/utils/handleDomainException'

const paramSchema = z.object({
    slug: z.string().max(100)
})

const bodySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Updates a solution by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, ...body } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({ config, organizationId, organizationSlug })
        })

    await organizationInteractor.updateSolutionBySlug(slug, body).catch(handleDomainException)
})