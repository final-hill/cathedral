import { getServerSession } from '#auth'
import { z } from "zod"
import { OrganizationInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories/OrganizationRepository'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization, Solution } from '#shared/domain'

// TODO: this feels backwards. Shouldn't the param be the organizationSlug and the body be the solutionSlug?

const paramSchema = Solution.innerType().pick({ slug: true })

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    organizationId,
    organizationSlug
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
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    await organizationInteractor.deleteSolutionBySlug(slug).catch(handleDomainException)
})
