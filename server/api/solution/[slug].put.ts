import { z } from 'zod'
import { Organization, Solution } from '#shared/domain'

const paramSchema = Solution.innerType().pick({ slug: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    bodySchema = z.object({
        ...Solution.innerType().pick({ name: true, description: true }).partial().shape,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Updates a solution by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, ...body } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug })

    await organizationInteractor.updateSolutionBySlug(slug, body).catch(handleDomainException)
})
