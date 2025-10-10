import { Organization, Solution } from '#shared/domain'
import handleDomainException from '~~/server/utils/handleDomainException'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,

    querySchema = z.object({
        solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * API endpoint to get pending review items (endorsements) for a specific solution
 * that the current user needs to review
 */
export default defineEventHandler(async (event) => {
    const { solutionSlug, organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        reviewInteractor = await createReviewInteractor({
            event,
            session,
            organizationId,
            organizationSlug,
            solutionSlug
        })

    return await reviewInteractor.getPendingEndorsementsForSolution()
        .catch(handleDomainException)
})
