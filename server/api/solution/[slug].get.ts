import { z } from 'zod'
import { Organization, Solution } from '#shared/domain'
import handleDomainException from '~~/server/utils/handleDomainException'

const paramSchema = Solution.pick({ slug: true }),
    { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams({ event, schema: paramSchema }),
        { organizationId, organizationSlug } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug })

    return await organizationInteractor.getSolutionBySlug(slug).catch(handleDomainException)
})
