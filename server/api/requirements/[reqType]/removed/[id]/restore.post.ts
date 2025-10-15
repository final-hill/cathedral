import { Organization, Solution } from '#shared/domain'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams({ event, schema: paramSchema }),
        bodySchema = z.object({
            solutionSlug: Solution.pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided'),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug } = await validateEventBody({ event, schema: bodySchema }),
        session = await requireUserSession(event),
        requirementInteractor = await createRequirementInteractor({
            event,
            session,
            organizationId: orgId,
            organizationSlug: orgSlug,
            solutionSlug
        })

    return requirementInteractor.restoreRemovedRequirement(id)
        .catch(handleDomainException)
})
