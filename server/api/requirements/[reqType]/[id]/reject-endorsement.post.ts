import { Organization, Solution } from '#shared/domain'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        bodySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug,
            reason: z.string().min(1, 'Reason is required for rejection')
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided'),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug, reason } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        reviewInteractor = await createReviewInteractor({
            event,
            session,
            organizationId: orgId,
            organizationSlug: orgSlug,
            solutionSlug
        })

    return reviewInteractor.rejectEndorsement({
        requirementId: id,
        reason
    }).catch(handleDomainException)
})
