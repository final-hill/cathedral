import { z } from 'zod'
import { Organization, Solution } from '#shared/domain'

// TODO: this feels backwards. Shouldn't the param be the organizationSlug and the body be the solutionSlug?

const paramSchema = Solution.innerType().pick({ slug: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    bodySchema = z.object({
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Delete a solution by slug.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams({ event, schema: paramSchema }),
        { organizationId, organizationSlug } = await validateEventBody({ event, schema: bodySchema }),
        session = await requireUserSession(event),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug })

    await organizationInteractor.deleteSolutionBySlug(slug).catch(handleDomainException)
})
